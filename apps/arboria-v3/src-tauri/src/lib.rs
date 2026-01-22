use tauri::Manager;
use tauri::path::BaseDirectory;
use std::sync::Mutex;

#[tauri::command]
async fn show_in_folder(path: String) -> Result<(), String> {
    #[cfg(windows)]
    {
        std::process::Command::new("explorer")
            .arg(format!("/select,{}", path))
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg("-R")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(all(not(windows), not(target_os = "macos")))]
    {
        let path_obj = std::path::Path::new(&path);
        let dir = if path_obj.is_dir() {
            path_obj
        } else {
            path_obj.parent().unwrap_or(std::path::Path::new("/"))
        };
        std::process::Command::new("xdg-open")
            .arg(dir)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn open_file_natively(path: String) -> Result<(), String> {
    #[cfg(windows)]
    {
        std::process::Command::new("cmd")
            .arg("/c")
            .arg("start")
            .arg("")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(all(not(windows), not(target_os = "macos")))]
    {
        std::process::Command::new("xdg-open")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn delete_file(path: String) -> Result<(), String> {
    if std::path::Path::new(&path).exists() {
        std::fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

// The following block is a placeholder for a permission definition,
// which would typically be in `tauri.conf.json` or `Cargo.toml`
// under a `[[tauri.permission]]` section, not directly in Rust code.
// [[permission]]
// identifier = "app-save-download-file"
// description = "Enables the save_download_file command to save downloaded files to disk."
// commands.allow = ["save_download_file"]
#[tauri::command]
async fn save_download_file(app_handle: tauri::AppHandle, filename: String, payload: String) -> Result<String, String> {
    use base64::{Engine as _, engine::general_purpose};
    
    let downloads_dir = app_handle.path().download_dir()
        .or_else(|_| {
            #[cfg(windows)]
            {
                std::env::var("USERPROFILE").map(|p| std::path::PathBuf::from(p).join("Downloads"))
            }
            #[cfg(not(windows))]
            {
                Err(std::io::Error::new(std::io::ErrorKind::NotFound, "No fallback"))
            }
        })
        .map_err(|e| format!("Could not resolve downloads directory: {}", e))?;
    
    let file_path = downloads_dir.join(&filename);
    let data = general_purpose::STANDARD.decode(payload)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;
    
    std::fs::write(&file_path, data)
        .map_err(|e| format!("Failed to write file to disk: {}", e))?;
        
    Ok(file_path.to_string_lossy().into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  // State to track the background server process
  struct ServerState {
      child: Mutex<Option<std::process::Child>>,
  }

  #[cfg(windows)]
  fn setup_job_object(child: &std::process::Child) {
      unsafe {
          use windows::Win32::System::JobObjects::{
              CreateJobObjectW, SetInformationJobObject, AssignProcessToJobObject,
              JobObjectExtendedLimitInformation, JOBOBJECT_EXTENDED_LIMIT_INFORMATION,
              JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE,
          };
          use std::os::windows::io::AsRawHandle;

          let job = CreateJobObjectW(None, None).expect("Failed to create job object");
          
          let mut info = JOBOBJECT_EXTENDED_LIMIT_INFORMATION::default();
          info.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;

          let _ = SetInformationJobObject(
              job,
              JobObjectExtendedLimitInformation,
              &info as *const _ as *const _,
              std::mem::size_of::<JOBOBJECT_EXTENDED_LIMIT_INFORMATION>() as u32,
          );

          let child_handle = windows::Win32::Foundation::HANDLE(child.as_raw_handle() as isize);
          let _ = AssignProcessToJobObject(job, child_handle);
          let _ = Box::leak(Box::new(job)); 
      }
  }

  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
        save_download_file,
        show_in_folder,
        open_file_natively,
        delete_file
    ])
    .manage(ServerState { child: Mutex::new(None) })
    .setup(|app| {
      #[cfg(debug_assertions)]
      {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      fn clean_path(path: &std::path::Path) -> String {
          let s = path.to_string_lossy().to_string();
          if s.starts_with(r"\\?\") {
              s[4..].to_string()
          } else {
              s
          }
      }

      let app_handle = app.handle().clone();
      
      tauri::async_runtime::spawn(async move {
          let resource_dir = app_handle.path().resource_dir().unwrap_or_else(|_| std::path::PathBuf::from("."));
          let log_dir = app_handle.path().app_log_dir().unwrap_or_else(|_| std::env::temp_dir());
          let _ = std::fs::create_dir_all(&log_dir);
          
          let server_path = app_handle.path().resolve("resources/server", BaseDirectory::Resource).ok();
          let node_exe_path = if let Some(sp) = server_path {
              let p = sp.join("node.exe");
              if p.exists() { Some(p) } else { None }
          } else {
              None
          };

          let final_node = node_exe_path.or_else(|| {
              let p1 = resource_dir.join("resources/server/node.exe");
              let p2 = resource_dir.join("server/node.exe");
              let p3 = resource_dir.join("node.exe");
              if p1.exists() { Some(p1) } 
              else if p2.exists() { Some(p2) } 
              else if p3.exists() { Some(p3) } 
              else { None }
          });

          if let Some(node_exe) = final_node {
              let working_dir = node_exe.parent().unwrap();
              let script_js = working_dir.join("index.js");

              let clean_node = clean_path(&node_exe);
              let clean_script = clean_path(&script_js);
              let clean_cwd = clean_path(working_dir);

              if script_js.exists() {
                  let log_file = std::fs::File::create(log_dir.join("server_stdout.log")).ok();
                  
                  #[cfg(windows)]
                  use std::os::windows::process::CommandExt;
                  #[cfg(windows)]
                  const CREATE_NO_WINDOW: u32 = 0x08000000;

                  let mut cmd = std::process::Command::new(&clean_node);
                  cmd.arg(&clean_script)
                     .current_dir(&clean_cwd);
                  #[cfg(windows)]
                  cmd.creation_flags(CREATE_NO_WINDOW);

                  if let Some(f) = log_file {
                      cmd.stdout(f.try_clone().unwrap());
                      cmd.stderr(f);
                  }

                  match cmd.spawn() {
                      Ok(child) => { 
                          #[cfg(windows)]
                          setup_job_object(&child);

                          let state = app_handle.state::<ServerState>();
                          let mut lock = state.child.lock().unwrap();
                          *lock = Some(child);
                      },
                      Err(_) => { }
                  }
              }
          }
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

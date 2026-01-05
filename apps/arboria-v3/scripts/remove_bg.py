from PIL import Image
import sys

def remove_white_bg(input_path, output_path, tolerance=30):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()
        
        new_data = []
        for item in datas:
            # item is (R, G, B, A)
            # Check if white-ish (all channels high)
            if item[0] > 255 - tolerance and item[1] > 255 - tolerance and item[2] > 255 - tolerance:
                new_data.append((255, 255, 255, 0)) # Transparent
            else:
                new_data.append(item)
                
        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Successfully removed background: {input_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Process public/logo.png
    remove_white_bg("public/logo.png", "public/logo.png")

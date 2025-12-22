-- Create storage bucket for task evidence
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', true);

-- Policy: Allow authenticated users to upload evidence
create policy "Authenticated users can upload evidence"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'evidence' );

-- Policy: Allow authenticated users to view evidence
create policy "Authenticated users can view evidence"
on storage.objects for select
to authenticated
using ( bucket_id = 'evidence' );

-- Policy: Users can only delete their own evidence
create policy "Users can delete own evidence"
on storage.objects for delete
to authenticated
using ( bucket_id = 'evidence' and auth.uid() = owner );

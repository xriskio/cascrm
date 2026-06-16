-- Create client_files table to cache QQCatalyst file information
CREATE TABLE IF NOT EXISTS client_files (
    id SERIAL PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    qqcatalyst_contact_id TEXT,
    qqcatalyst_file_id INTEGER UNIQUE,
    blob_container_info_id INTEGER,
    blob_file_name TEXT,
    file_name TEXT,
    display_name TEXT,
    file_type TEXT,
    file_size INTEGER,
    description TEXT,
    blob_url TEXT,
    thumbnail_blob_file_name TEXT,
    category_descriptor TEXT,
    download_file_type TEXT,
    usage_code TEXT,
    tags TEXT,
    folder_id INTEGER,
    storage_location_id INTEGER,
    related_policy_ids INTEGER[],
    is_active BOOLEAN DEFAULT true,
    is_readonly BOOLEAN DEFAULT false,
    exclude_from_storage_cost BOOLEAN DEFAULT false,
    should_have_thumbnail BOOLEAN DEFAULT false,
    created_by TEXT,
    created_by_id INTEGER,
    app_created TEXT,
    bulk_insert_id UUID,
    bulk_insert_session_id UUID,
    qqcatalyst_created_on TIMESTAMP,
    created_on_searchable TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_files_client_id ON client_files(client_id);
CREATE INDEX IF NOT EXISTS idx_client_files_qqcatalyst_contact_id ON client_files(qqcatalyst_contact_id);
CREATE INDEX IF NOT EXISTS idx_client_files_qqcatalyst_file_id ON client_files(qqcatalyst_file_id);
CREATE INDEX IF NOT EXISTS idx_client_files_file_type ON client_files(file_type);
CREATE INDEX IF NOT EXISTS idx_client_files_created_at ON client_files(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_client_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_files_updated_at
    BEFORE UPDATE ON client_files
    FOR EACH ROW
    EXECUTE FUNCTION update_client_files_updated_at();

-- Function to upsert client files from QQCatalyst
CREATE OR REPLACE FUNCTION upsert_client_file(
    p_client_id UUID,
    p_qqcatalyst_contact_id TEXT,
    p_qqcatalyst_file_id INTEGER,
    p_blob_container_info_id INTEGER,
    p_blob_file_name TEXT,
    p_file_name TEXT,
    p_display_name TEXT,
    p_file_type TEXT,
    p_file_size INTEGER,
    p_description TEXT,
    p_blob_url TEXT,
    p_thumbnail_blob_file_name TEXT,
    p_category_descriptor TEXT,
    p_download_file_type TEXT,
    p_usage_code TEXT,
    p_tags TEXT,
    p_folder_id INTEGER,
    p_storage_location_id INTEGER,
    p_related_policy_ids INTEGER[],
    p_is_active BOOLEAN,
    p_is_readonly BOOLEAN,
    p_exclude_from_storage_cost BOOLEAN,
    p_should_have_thumbnail BOOLEAN,
    p_created_by TEXT,
    p_created_by_id INTEGER,
    p_app_created TEXT,
    p_bulk_insert_id UUID,
    p_bulk_insert_session_id UUID,
    p_qqcatalyst_created_on TIMESTAMP,
    p_created_on_searchable TEXT
)
RETURNS client_files AS $$
DECLARE
    result client_files;
BEGIN
    INSERT INTO client_files (
        client_id,
        qqcatalyst_contact_id,
        qqcatalyst_file_id,
        blob_container_info_id,
        blob_file_name,
        file_name,
        display_name,
        file_type,
        file_size,
        description,
        blob_url,
        thumbnail_blob_file_name,
        category_descriptor,
        download_file_type,
        usage_code,
        tags,
        folder_id,
        storage_location_id,
        related_policy_ids,
        is_active,
        is_readonly,
        exclude_from_storage_cost,
        should_have_thumbnail,
        created_by,
        created_by_id,
        app_created,
        bulk_insert_id,
        bulk_insert_session_id,
        qqcatalyst_created_on,
        created_on_searchable,
        synced_at
    ) VALUES (
        p_client_id,
        p_qqcatalyst_contact_id,
        p_qqcatalyst_file_id,
        p_blob_container_info_id,
        p_blob_file_name,
        p_file_name,
        p_display_name,
        p_file_type,
        p_file_size,
        p_description,
        p_blob_url,
        p_thumbnail_blob_file_name,
        p_category_descriptor,
        p_download_file_type,
        p_usage_code,
        p_tags,
        p_folder_id,
        p_storage_location_id,
        p_related_policy_ids,
        p_is_active,
        p_is_readonly,
        p_exclude_from_storage_cost,
        p_should_have_thumbnail,
        p_created_by,
        p_created_by_id,
        p_app_created,
        p_bulk_insert_id,
        p_bulk_insert_session_id,
        p_qqcatalyst_created_on,
        p_created_on_searchable,
        NOW()
    )
    ON CONFLICT (qqcatalyst_file_id) 
    DO UPDATE SET
        client_id = EXCLUDED.client_id,
        qqcatalyst_contact_id = EXCLUDED.qqcatalyst_contact_id,
        blob_container_info_id = EXCLUDED.blob_container_info_id,
        blob_file_name = EXCLUDED.blob_file_name,
        file_name = EXCLUDED.file_name,
        display_name = EXCLUDED.display_name,
        file_type = EXCLUDED.file_type,
        file_size = EXCLUDED.file_size,
        description = EXCLUDED.description,
        blob_url = EXCLUDED.blob_url,
        thumbnail_blob_file_name = EXCLUDED.thumbnail_blob_file_name,
        category_descriptor = EXCLUDED.category_descriptor,
        download_file_type = EXCLUDED.download_file_type,
        usage_code = EXCLUDED.usage_code,
        tags = EXCLUDED.tags,
        folder_id = EXCLUDED.folder_id,
        storage_location_id = EXCLUDED.storage_location_id,
        related_policy_ids = EXCLUDED.related_policy_ids,
        is_active = EXCLUDED.is_active,
        is_readonly = EXCLUDED.is_readonly,
        exclude_from_storage_cost = EXCLUDED.exclude_from_storage_cost,
        should_have_thumbnail = EXCLUDED.should_have_thumbnail,
        created_by = EXCLUDED.created_by,
        created_by_id = EXCLUDED.created_by_id,
        app_created = EXCLUDED.app_created,
        bulk_insert_id = EXCLUDED.bulk_insert_id,
        bulk_insert_session_id = EXCLUDED.bulk_insert_session_id,
        qqcatalyst_created_on = EXCLUDED.qqcatalyst_created_on,
        created_on_searchable = EXCLUDED.created_on_searchable,
        synced_at = NOW(),
        updated_at = NOW()
    RETURNING *;
    
    GET DIAGNOSTICS result = ROW_COUNT;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON client_files TO PUBLIC;
GRANT ALL ON client_files TO service_role;

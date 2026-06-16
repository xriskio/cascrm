-- Add policy files tracking table
CREATE TABLE IF NOT EXISTS qqcatalyst_policy_files (
    id SERIAL PRIMARY KEY,
    policy_id VARCHAR(50) NOT NULL,
    contact_id VARCHAR(50) NOT NULL,
    file_id INTEGER NOT NULL,
    blob_container_info_id INTEGER,
    blob_file_name TEXT,
    file_name TEXT,
    display_name TEXT,
    file_type TEXT,
    created_on TIMESTAMP,
    created_by TEXT,
    entity_id INTEGER,
    file_relation INTEGER,
    created_by_id INTEGER,
    active BOOLEAN DEFAULT true,
    description TEXT,
    thumbnail_blob_file_name TEXT,
    thumbnail_avatar_blob_file_name TEXT,
    file_size BIGINT DEFAULT 0,
    app_created TEXT,
    related_policy_ids INTEGER[],
    category_descriptor TEXT,
    download_file_type TEXT,
    readonly BOOLEAN DEFAULT false,
    usage_code TEXT,
    storage_location_id INTEGER,
    created_on_searchable TEXT,
    folder_id INTEGER,
    exclude_from_storage_cost BOOLEAN DEFAULT false,
    blob_url TEXT,
    tags TEXT,
    bulk_insert_id UUID,
    bulk_insert_session_id UUID,
    should_have_thumbnail BOOLEAN DEFAULT false,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_files_policy_id ON qqcatalyst_policy_files(policy_id);
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_files_contact_id ON qqcatalyst_policy_files(contact_id);
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_files_file_type ON qqcatalyst_policy_files(file_type);
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_files_active ON qqcatalyst_policy_files(active);
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_files_created_on ON qqcatalyst_policy_files(created_on);

-- Add composite indexes
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_files_policy_contact ON qqcatalyst_policy_files(policy_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_qqcatalyst_policy_files_policy_type ON qqcatalyst_policy_files(policy_id, file_type);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_qqcatalyst_policy_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_qqcatalyst_policy_files_updated_at
    BEFORE UPDATE ON qqcatalyst_policy_files
    FOR EACH ROW
    EXECUTE FUNCTION update_qqcatalyst_policy_files_updated_at();

-- Function to upsert policy file data
CREATE OR REPLACE FUNCTION upsert_qqcatalyst_policy_file(
    p_policy_id VARCHAR(50),
    p_contact_id VARCHAR(50),
    p_file_id INTEGER,
    p_file_data JSONB
) RETURNS VOID AS $$
BEGIN
    INSERT INTO qqcatalyst_policy_files (
        policy_id, contact_id, file_id, blob_container_info_id, blob_file_name,
        file_name, display_name, file_type, created_on, created_by, entity_id,
        file_relation, created_by_id, active, description, thumbnail_blob_file_name,
        thumbnail_avatar_blob_file_name, file_size, app_created, related_policy_ids,
        category_descriptor, download_file_type, readonly, usage_code,
        storage_location_id, created_on_searchable, folder_id, exclude_from_storage_cost,
        blob_url, tags, bulk_insert_id, bulk_insert_session_id, should_have_thumbnail
    ) VALUES (
        p_policy_id, p_contact_id, p_file_id,
        (p_file_data->>'BlobContainerInfoId')::INTEGER,
        p_file_data->>'BlobFileName',
        p_file_data->>'FileName',
        p_file_data->>'DisplayName',
        p_file_data->>'FileType',
        (p_file_data->>'CreatedOn')::TIMESTAMP,
        p_file_data->>'CreatedBy',
        (p_file_data->>'EntityId')::INTEGER,
        (p_file_data->>'FileRelation')::INTEGER,
        (p_file_data->>'CreatedById')::INTEGER,
        (p_file_data->>'Active')::BOOLEAN,
        p_file_data->>'Description',
        p_file_data->>'ThumnbailBlobFileName',
        p_file_data->>'ThumbnailAvatarBlobFileName',
        (p_file_data->>'FileSize')::BIGINT,
        p_file_data->>'AppCreated',
        ARRAY(SELECT jsonb_array_elements_text(p_file_data->'RelatedPolicyIDs'))::INTEGER[],
        p_file_data->>'CategoryDescriptor',
        p_file_data->>'DownloadFileType',
        (p_file_data->>'Readonly')::BOOLEAN,
        p_file_data->>'UsageCode',
        (p_file_data->>'StorageLocationId')::INTEGER,
        p_file_data->>'CreatedOnSearchable',
        (p_file_data->>'FolderId')::INTEGER,
        (p_file_data->>'ExcludeFromStorageCost')::BOOLEAN,
        p_file_data->>'BlobUrl',
        p_file_data->>'Tags',
        (p_file_data->>'BulkInsertId')::UUID,
        (p_file_data->>'BulkInsertSessionId')::UUID,
        (p_file_data->>'ShouldHaveThumbnail')::BOOLEAN
    )
    ON CONFLICT (policy_id, contact_id, file_id) 
    DO UPDATE SET
        blob_container_info_id = EXCLUDED.blob_container_info_id,
        blob_file_name = EXCLUDED.blob_file_name,
        file_name = EXCLUDED.file_name,
        display_name = EXCLUDED.display_name,
        file_type = EXCLUDED.file_type,
        created_on = EXCLUDED.created_on,
        created_by = EXCLUDED.created_by,
        entity_id = EXCLUDED.entity_id,
        file_relation = EXCLUDED.file_relation,
        created_by_id = EXCLUDED.created_by_id,
        active = EXCLUDED.active,
        description = EXCLUDED.description,
        thumbnail_blob_file_name = EXCLUDED.thumbnail_blob_file_name,
        thumbnail_avatar_blob_file_name = EXCLUDED.thumbnail_avatar_blob_file_name,
        file_size = EXCLUDED.file_size,
        app_created = EXCLUDED.app_created,
        related_policy_ids = EXCLUDED.related_policy_ids,
        category_descriptor = EXCLUDED.category_descriptor,
        download_file_type = EXCLUDED.download_file_type,
        readonly = EXCLUDED.readonly,
        usage_code = EXCLUDED.usage_code,
        storage_location_id = EXCLUDED.storage_location_id,
        created_on_searchable = EXCLUDED.created_on_searchable,
        folder_id = EXCLUDED.folder_id,
        exclude_from_storage_cost = EXCLUDED.exclude_from_storage_cost,
        blob_url = EXCLUDED.blob_url,
        tags = EXCLUDED.tags,
        bulk_insert_id = EXCLUDED.bulk_insert_id,
        bulk_insert_session_id = EXCLUDED.bulk_insert_session_id,
        should_have_thumbnail = EXCLUDED.should_have_thumbnail,
        synced_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint
ALTER TABLE qqcatalyst_policy_files 
ADD CONSTRAINT unique_policy_contact_file 
UNIQUE (policy_id, contact_id, file_id);

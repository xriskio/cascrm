export interface BlobInfoDTO {
  Id: number
  BlobContainerInfoId: number
  BlobFileName: string
  FileName: string
  DisplayName: string
  FileType: string
  CreatedOn: string
  CreatedBy: string
  EntityId: number
  FileRelation: number
  CreatedById: number
  Active: boolean
  Description: string
  ThumnbailBlobFileName: string
  ThumbnailAvatarBlobFileName: string
  FileSize: number
  AppCreated: string
  RelatedPolicyIDs: number[]
  CategoryDescriptor: string
  File: string // Base64 encoded file content
  DownloadFileType: string
  Readonly: boolean
  UsageCode: string
  StorageLocationId: number
  CreatedOnSearchable: string
  FolderId: number
  ExcludeFromStorageCost: boolean
  BlobUrl: string
  Tags: string
  BulkInsertId: string
  BulkInsertSessionId: string
  ShouldHaveThumbnail: boolean
}

export interface PageLink {
  Rel: string
  Href: string
}

export interface PageOfBlobInfoDTO {
  Data: BlobInfoDTO[]
  PageNumber: number
  PagesTotal: number
  TotalItems: number
  IsSuccess: boolean
  ErrorCode: string
  ErrorMessage: string
  DisplayMessage: string
  Links: PageLink[]
  Href: string
}

export interface FetchFilesParams {
  contactId: string
  dlFileType: string
  pageNumber?: number
  pageSize?: number
}

export interface FetchPolicyFilesParams {
  contactId: string
  policyId: string
  dlFileType: string
  pageNumber?: number
  pageSize?: number
}

// Common file types for the dlFileType parameter
export const FILE_TYPES = {
  ALL: "All",
  DOCUMENTS: "Documents",
  IMAGES: "Images",
  POLICIES: "Policies",
  CLAIMS: "Claims",
  CERTIFICATES: "Certificates",
  APPLICATIONS: "Applications",
} as const

export type FileType = (typeof FILE_TYPES)[keyof typeof FILE_TYPES]

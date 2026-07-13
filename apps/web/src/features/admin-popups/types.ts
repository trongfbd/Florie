export interface Popup {
  id: string;
  title: string;
  imageUrl: string | null;
  content: string | null;
  linkUrl: string | null;
  isActive: boolean;
}

export interface PopupFormInput {
  title: string;
  imageUrl?: string;
  content?: string;
  linkUrl?: string;
  isActive?: boolean;
}

export interface PaginatedPopups {
  data: Popup[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

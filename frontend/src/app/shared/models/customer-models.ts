export interface CustomerListItemDto {
  id: string;
  name: string;
  email: string;
  document: string;
  createdAt: string;
}

export interface CustomerFormData {
  id?: string;
  name: string;
  email: string;
  document: string;
}

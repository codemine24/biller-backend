export interface CreateCustomerPayload {
  name: string;
  email?: string;
  contact_number: string;
  address?: string;
  subscriber_id: string;
}

export interface UpdateCustomerPayload {
  name?: string;
  email?: string;
  contact_number?: string;
  address?: string;
  is_active?: boolean;
  total_due?: number;
}

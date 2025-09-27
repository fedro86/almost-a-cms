export interface ContentFile {
  name: string;
  displayName: string;
  icon: string;
  description: string;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface AboutData {
  title: string;
  description: string[];
  services: {
    title: string;
    list: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  testimonials: Array<{
    avatar: string;
    name: string;
    date?: string;
    text: string;
  }>;
  clients: string[];
}

export interface ContactData {
  title: string;
  contacts: Array<{
    type: string;
    value: string;
    icon: string;
  }>;
  social: Array<{
    name: string;
    url: string;
    icon: string;
  }>;
}

export type ContentData = AboutData | ContactData | any;
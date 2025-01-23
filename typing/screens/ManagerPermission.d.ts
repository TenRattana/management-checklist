
export interface GroupPermissons {
  GUserID: string;
  PermissonID: number;
  PermissonStatus: boolean;
  IsActive: boolean;
}

export interface Permissons {
  PermissonID: number;
  PermissonName: string;
  Description?: string;
  IsActive: boolean;
}


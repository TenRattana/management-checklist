interface SettingProps {
    isVisible: boolean;
    setVisible: () => void;
}

export interface ConfigurationProps {
    prefix: any;
    handleSubmit: (field: string, values: { [key: string]: any }) => void;
    edit: { [key: string]: boolean };
    handelEdit: (field: string, value: boolean) => void;
}

export interface ConfigItemProps {
    label: string;
    value: string;
    editable: boolean;
    onEdit: (v: boolean) => void;
    state: any;
    handleSubmit: (field: string, values: { [x: number]: any }) => void;
}

export interface RennderFormikPorps {
    field: string;
    state: any;
    handleSubmit: (field: string, values: { [x: number]: any }) => void;
    onEdit: (v: boolean) => void;
}
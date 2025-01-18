export interface Category {
    id: string;
    title: string;
    color: string;
}

export interface RanderCategory { 
    item: Category; 
    toggleCheckbox: any, 
    checkedItems: Record<string, boolean> 
}

export interface Home_dialogProps {
    dialogVisible: boolean;
    hideDialog: () => void;
    selectedEvent: any;
}
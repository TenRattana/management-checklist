import { NavigationProp, Route } from "@react-navigation/native";
import { CheckList, CheckListType } from "./CheckList";
import { BaseFormState, BaseSubForm } from "../form";

export type CreateFormParams = { formId: string };

export interface CreateFormProps {
  navigation: NavigationProp<any>;
  route: Route<CreateFormParams>;
}

interface RowItemProps<V extends BaseFormState | BaseSubForm> {
    item: V;
    drag: () => void;
    getIndex: () => number | undefined;
    isActive: boolean;
    setIsEditing: any;
    setDialogVisible: any
    handleField: any
    checkListType: any[]
}

export interface CreateForm {
    label: string;
    value: string;
    editable: boolean;
    onEdit: (v: boolean) => void;
}

export interface DragfieldProps {
  data: BaseFormState[];
  SFormID: string;
  dispatch: any;
  checkLists: CheckListType[];
  index?: string;
  Columns?: number;
}

export interface DragItem {
  item: CheckListType; 
  onDrop: (item: CheckListType, absoluteX: number, absoluteY: number) => void;
}

export interface DragsubformProps {
  checkLists: CheckListType[];
  index?: string;
}

export interface FormValues {
    [key: string]: any;
}
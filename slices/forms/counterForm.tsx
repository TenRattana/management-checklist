import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BaseForm {
  FormID: string;
  FormName: string;
  Description: string;
  MachineID: string;
}

interface FormState {
  MCListID: string;
  CListID: string;
  GCLOptionID: string;
  CTypeID: string;
  CListName?: string;
  CTypeName?: string;
  DTypeID: string;
  DTypeValue?: number;
  SFormID: string;
  Required: boolean;
  MinLength?: number;
  MaxLength?: number;
  Description: string;
  Placeholder: string;
  Hint: string;
  DisplayOrder: number;
  EResult: string;
}
interface BaseSubForm {
  SFormID: string;
  SFormName: string;
  FormID: string;
  Columns: number;
  DisplayOrder: number;
  MachineID: string;
  Fields?: FormState[];
}

interface Checklist {
  CListID: string;
  CListName: string;
  IsActive: boolean;
}

interface CheckListType {
  CTypeID: string;
  CTypeName: string;
  Icon: string;
}

interface Form extends BaseForm {
  subForms: BaseSubForm[];
}

const initialState: Form = {
  FormID: "",
  FormName: "",
  Description: "",
  MachineID: "",
  subForms: []
};

const sortSubForms = (data: BaseSubForm[]) => {
  return data.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
};

const sortFields = (fields: FormState[]) => {
  return fields.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
};

const subFormSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setForm: (state, action: PayloadAction<{ form: BaseForm }>) => {
      const { form } = action.payload;

      state.FormID = form.FormID;
      state.FormName = form.FormName;
      state.Description = form.Description;
      state.MachineID = form.MachineID;
    },
    setSubForm: (state, action: PayloadAction<{ subForms: BaseSubForm[] }>) => {
      const { subForms } = action.payload;

      state.subForms = subForms.map((sub, index) =>
      ({
        ...sub,
        Columns: sub.Columns,
        DisplayOrder: sub.DisplayOrder < 0 ? index : sub.DisplayOrder,
      }));

      sortSubForms(state.subForms);
    },
    setDragSubForm: (state, action: PayloadAction<{ data: Omit<BaseSubForm, 'DisplayOrder'>[] }>) => {
      const { data } = action.payload;

      state.subForms = data.map((sub, index) => ({
        ...sub,
        Columns: sub.Columns,
        DisplayOrder: index,
      }));

      sortSubForms(state.subForms);
    },
    setField: (state, action: PayloadAction<{
      formState: FormState[];
      checkList: Checklist[];
      checkListType: CheckListType[];
    }>) => {
      const { formState, checkList, checkListType } = action.payload;

      const checkListMap = new Map(checkList.map(item => [item.CListID, item.CListName]));
      const checkListTypeMap = new Map(checkListType.map(item => [item.CTypeID, item.CTypeName]));

      state.subForms.forEach((sub) => {
        const matchingForms = formState.filter(form => form.SFormID === sub.SFormID);

        if (matchingForms.length > 0) {
          const updatedFields = matchingForms.map((field, index) => ({
            ...field,
            displayOrder: field.DisplayOrder < 0 ? index : field.DisplayOrder,
            CListName: checkListMap.get(field.CListID) || "",
            CTypeName: checkListTypeMap.get(field.CTypeID) || "",
          }));

          sub.Fields = updatedFields;
          sortFields(sub.Fields);
        }
      });

      sortSubForms(state.subForms);
    },
    setDragField: (state, action: PayloadAction<{ data: Omit<FormState, 'DisplayOrder'>[] }>) => {
      const { data } = action.payload;

      state.subForms.forEach((sub) => {
        const matchingForms = data.filter(form => form.SFormID === sub.SFormID);

        if (matchingForms.length > 0) {
          const updatedFields = matchingForms.map((field, index) => ({
            ...field,
            displayOrder: index,
          }));

          sub.Fields = updatedFields;
        }
      });
    },
    addSubForm: (state, action: PayloadAction<{ subForm: BaseSubForm }>) => {
      const { subForm } = action.payload;

      state.subForms.push({
        ...subForm,
        SFormID: String(state.subForms.length + 1),
        DisplayOrder: state.subForms.length + 1,
      });

      sortSubForms(state.subForms);
    },
    updateSubForm: (state, action: PayloadAction<{ subForm: BaseSubForm }>) => {
      const { subForm } = action.payload;

      state.subForms = state.subForms.map((existingSub) => {
        if (existingSub.SFormID === subForm.SFormID) {
          return {
            ...existingSub,
            SFormName: subForm.SFormName,
            Columns: subForm.Columns,
          };
        }
        return existingSub;
      });

      sortSubForms(state.subForms);
    },
    deleteSubForm: (state, action: PayloadAction<{ values: string }>) => {
      const { values } = action.payload;
      state.subForms = state.subForms.filter((subForm) => subForm.SFormID !== values);
    },
    // addField: (state, action: PayloadAction<{
    //   formState: Field;
    //   checkList: any[];
    //   checkListType: any[];
    // }>) => {
    //   const { formState, checkList, checkListType } = action.payload;

    //   state.subForms = state.subForms.map((sub) => {
    //     if (sub.subFormId === formState.subFormId) {
    //       const updatedFields = [
    //         ...sub.fields,
    //         {
    //           ...formState,
    //           displayOrder: sub.fields.length + 1,
    //           CheckListName:
    //             checkList.find((v) => v.checkListId === formState.checkListId)?.CListName || "",
    //           CheckListTypeName:
    //             checkListType.find((v) => v.checkListTypeId === formState.checkListTypeId)?.CTypeName || "",
    //         },
    //       ];

    //       sortFields(updatedFields);

    //       return {
    //         ...sub,
    //         fields: updatedFields,
    //       };
    //     }
    //     return sub;
    //   });
    //   sortSubForms(state.subForms);
    // },
    // updateField: (state, action: PayloadAction<{
    //   formState: Field;
    //   checkList: any[];
    //   checkListType: any[];
    // }>) => {
    //   const { formState, checkList, checkListType } = action.payload;

    //   state.subForms = state.subForms.map((sub) => {
    //     if (sub.subFormId === formState.subFormId) {
    //       const updatedFields = sub.fields.map((field) => {
    //         if (field.matchCheckListId === formState.matchCheckListId) {
    //           return {
    //             ...formState,
    //             displayOrder: field.displayOrder,
    //             CheckListName:
    //               checkList.find((v) => v.checkListId === formState.checkListId)?.CListName || "",
    //             CheckListTypeName:
    //               checkListType.find((v) => v.checkListTypeId === formState.checkListTypeId)?.CTypeName || "",
    //           };
    //         }
    //         return field;
    //       });

    //       sortFields(updatedFields);

    //       return {
    //         ...sub,
    //         fields: updatedFields,
    //       };
    //     }
    //     return sub;
    //   });
    //   sortSubForms(state.subForms);
    // },
    // deleteField: (state, action: PayloadAction<{
    //   subFormId: string;
    //   field: string;
    // }>) => {
    //   const { subFormId, field } = action.payload;

    //   state.subForms = state.subForms.map((subForm) => {
    //     if (subForm.subFormId === subFormId) {
    //       return {
    //         ...subForm,
    //         fields: subForm.fields.filter((f) => f.matchCheckListId !== field),
    //       };
    //     }
    //     return subForm;
    //   });
    //   sortSubForms(state.subForms);
    // },
    // setExpected: (state, action: PayloadAction<{ formData: Record<string, any> }>) => {
    //   const { formData } = action.payload;

    //   state.subForms.forEach((sub) => {
    //     sub.fields.forEach((field) => {
    //       field.expectedResult = formData[field.matchCheckListId] || null;
    //     });
    //   });
    // },
    reset: () => initialState,
  },
});

export const {
  setForm,
  setSubForm,
  setDragSubForm,
  setDragField,
  setField,
  addSubForm,
  updateSubForm,
  deleteSubForm,
  // addField,
  // updateField,
  // deleteField,
  // setExpected,
  reset,
} = subFormSlice.actions;

export default subFormSlice.reducer;

console.log("slices/forms");

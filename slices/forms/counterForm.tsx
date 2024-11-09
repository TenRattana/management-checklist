import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseSubForm, BaseFormState, Form, BaseForm } from '@/typing/form'
import { Checklist, CheckListType, DataType } from '@/typing/type'


const initialState: Form = {
  FormID: "",
  FormName: "",
  Description: "",
  MachineID: "",
  MachineName: "",
  subForms: []
};

const sortSubForms = (data: BaseSubForm[]) => {
  return data.sort((a, b) => {
    const orderA = a.DisplayOrder ?? Number.POSITIVE_INFINITY;
    const orderB = b.DisplayOrder ?? Number.POSITIVE_INFINITY;

    return orderA - orderB;
  });
};

const sortFields = (fields: BaseFormState[]) => {
  return fields.sort((a, b) => {
    const orderA = a.DisplayOrder ?? Number.POSITIVE_INFINITY;
    const orderB = b.DisplayOrder ?? Number.POSITIVE_INFINITY;

    return orderA - orderB;
  });
};

const subFormSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setForm: (state, action: PayloadAction<{ form?: BaseForm }>) => {

      const { form } = action.payload;

      state.FormID = form?.FormID || "";
      state.FormName = form?.FormName || "";
      state.Description = form?.Description || "";
      state.MachineID = form?.MachineID || "";
      state.MachineName = form?.MachineName;
    },
    updateFormName: (state, action: PayloadAction<{ form?: string }>) => {
      const { form } = action.payload;

      state.FormName = form || "";
    },
    updateFormDescription: (state, action: PayloadAction<{ form?: string }>) => {
      const { form } = action.payload;

      state.Description = form || "";
    },
    setSubForm: (state, action: PayloadAction<{ subForms: BaseSubForm[] }>) => {

      const { subForms } = action.payload;

      state.subForms = subForms.map((sub, index) =>
      ({
        ...sub,
        Columns: sub.Columns,
        DisplayOrder: sub?.DisplayOrder ? index : sub.DisplayOrder,
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
      BaseFormState: BaseFormState[];
      checkList: Checklist[];
      checkListType: CheckListType[];
    }>) => {

      const { BaseFormState, checkList, checkListType } = action.payload;

      const checkListMap = new Map(checkList.map(item => [item.CListID, item.CListName]));
      const checkListTypeMap = new Map(checkListType.map(item => [item.CTypeID, item.CTypeName]));

      state.subForms.forEach((sub) => {
        const matchingForms = BaseFormState.filter(form => form.SFormID === sub.SFormID);

        if (matchingForms.length > 0) {
          const updatedFields = matchingForms.map((field, index) => ({
            ...field,
            DisplayOrder: field?.DisplayOrder ? index : field.DisplayOrder,
            CListName: checkListMap.get(field.CListID) || "",
            CTypeName: checkListTypeMap.get(field.CTypeID) || "",
          }));

          sub.Fields = updatedFields;
          sortFields(sub.Fields);
        }
      });

      sortSubForms(state.subForms);
    },
    setDragField: (state, action: PayloadAction<{ data: Omit<BaseFormState, 'DisplayOrder'>[] }>) => {

      const { data } = action.payload;

      state.subForms.forEach((sub) => {
        const matchingForms = data.filter(form => form.SFormID === sub.SFormID);

        if (matchingForms.length > 0) {
          const updatedFields = matchingForms.map((field, index) => ({
            ...field,
            DisplayOrder: index,
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
    deleteSubForm: (state, action: PayloadAction<{ SFormID: string }>) => {

      const { SFormID } = action.payload;
      state.subForms = state.subForms.filter((subForm) => subForm.SFormID !== SFormID);
    },
    addField: (state, action: PayloadAction<{
      BaseFormState: BaseFormState;
      checkList: Checklist[];
      checkListType: CheckListType[];
      dataType: DataType[];
    }>) => {
      const { BaseFormState, checkList, checkListType, dataType } = action.payload;

      console.log(BaseFormState);

      // const formData: BaseFormState = BaseFormState.DTypeID === null
      //   ? {
      //     ...BaseFormState,
      //     DTypeID: dataType.find((v) => v.DTypeName === "String")?.DTypeID ?? "",
      //     DTypeValue: undefined,
      //   }
      //   : BaseFormState;

      // state.subForms = state.subForms.map((sub) => {
      //   if (sub.SFormID === formData.SFormID) {
      //     const addField = {
      //       ...formData,
      //       DisplayOrder: (sub.Fields?.length || 0) + 1,
      //       CListName: checkList.find((v) => v.CListID === formData.CListID)?.CListName,
      //       CTypeName: checkListType.find((v) => v.CTypeID === formData.CTypeID)?.CTypeName,
      //     };

      //     const updatedFields = [...(sub.Fields || []), addField];
      //     const sortedFields = sortFields(updatedFields);

      //     return {
      //       ...sub,
      //       Fields: sortedFields,
      //     };
      //   }
      //   return sub;
      // });
    },
    updateField: (state, action: PayloadAction<{
      BaseFormState: BaseFormState;
      checkList: Checklist[];
      checkListType: CheckListType[];
      dataType: DataType[];
    }>) => {
      const { BaseFormState, checkList, checkListType, dataType } = action.payload;
      console.log(BaseFormState);

      // const formData: BaseFormState = BaseFormState.DTypeID === null
      //   ? {
      //     ...BaseFormState,
      //     DTypeID: dataType.find((v) => v.DTypeName === "String")?.DTypeID ?? "",
      //     DTypeValue: undefined,
      //   }
      //   : BaseFormState;

      // state.subForms = state.subForms.map((sub) => {
      //   if (sub.SFormID === formData.SFormID) {
      //     const updatedFields = sub.Fields?.map((field) => {
      //       if (field.MCListID === formData.MCListID) {
      //         return {
      //           ...formData,
      //           DisplayOrder: field.DisplayOrder,
      //           CListName: checkList.find((v) => v.CListID === formData.CListID)?.CListName,
      //           CTypeName: checkListType.find((v) => v.CTypeID === formData.CTypeID)?.CTypeName,
      //         };
      //       }
      //       return field;
      //     }) || [];

      //     return {
      //       ...sub,
      //       Fields: updatedFields,
      //     };
      //   }
      //   return sub;
      // });

      // sortSubForms(state.subForms);
    },
    deleteField: (state, action: PayloadAction<{
      SFormID: string;
      MCListID: string;
    }>) => {
      const { SFormID, MCListID } = action.payload;

      state.subForms = state.subForms.map((subForm) => {
        if (subForm.SFormID === SFormID) {
          return {
            ...subForm,
            Fields: subForm.Fields?.filter((f) => f.MCListID !== MCListID),
          };
        }
        return subForm;
      });
      sortSubForms(state.subForms);
    },
    reset: () => initialState,
    defaultDataForm: (state, action: PayloadAction<{
      currentField: BaseFormState;
    }>) => {

      const { currentField } = action.payload

      state.subForms = state.subForms.map((sub) => {
        if (sub.SFormID === currentField.SFormID) {
          const addField = {
            ...currentField,
            DisplayOrder: (sub.Fields?.length || 0) + 1,
          };

          const updatedFields = [...(sub.Fields || []), addField];
          const sortedFields = sortFields(updatedFields);

          return {
            ...sub,
            Fields: sortedFields,
          };
        }
        return sub;
      });
    }
  },

});

export const {
  setForm,
  updateFormName,
  updateFormDescription,
  setSubForm,
  setDragSubForm,
  setDragField,
  setField,
  addSubForm,
  updateSubForm,
  deleteSubForm,
  addField,
  updateField,
  deleteField,
  reset,
  defaultDataForm
} = subFormSlice.actions;

export default subFormSlice.reducer;
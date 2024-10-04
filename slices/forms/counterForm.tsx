import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseSubForm, BaseFormState, Form, BaseForm } from '@/typing/form'
import { Checklist, CheckListType, DataType } from '@/typing/type'


const initialState: Form = {
  FormID: "",
  FormName: "",
  Description: "",
  MachineID: "",
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
      console.log("setForm");

      const { form } = action.payload;

      state.FormID = form?.FormID || "";
      state.FormName = form?.FormName || "";
      state.Description = form?.Description || "";
      state.MachineID = form?.MachineID || "";
    },
    setSubForm: (state, action: PayloadAction<{ subForms: BaseSubForm[] }>) => {
      console.log("setSubForm");

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
      console.log("setDragSubForm");

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
      console.log("setField");

      const { BaseFormState, checkList, checkListType } = action.payload;

      const checkListMap = new Map(checkList.map(item => [item.CListID, item.CListName]));
      const checkListTypeMap = new Map(checkListType.map(item => [item.CTypeID, item.CTypeName]));

      state.subForms.forEach((sub) => {
        const matchingForms = BaseFormState.filter(form => form.SFormID === sub.SFormID);

        if (matchingForms.length > 0) {
          const updatedFields = matchingForms.map((field, index) => ({
            ...field,
            displayOrder: field?.DisplayOrder ? index : field.DisplayOrder,
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
      console.log("setDragField");

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
      console.log("addSubForm");

      const { subForm } = action.payload;

      state.subForms.push({
        ...subForm,
        SFormID: String(state.subForms.length + 1),
        DisplayOrder: state.subForms.length + 1,
      });

      sortSubForms(state.subForms);
    },
    updateSubForm: (state, action: PayloadAction<{ subForm: BaseSubForm }>) => {
      console.log("updateSubForm");

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
      console.log("deleteSubForm");

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
      console.log("addField");
      console.log(BaseFormState);

      const formData: BaseFormState = BaseFormState.DTypeID === null
        ? {
          ...BaseFormState,
          DTypeID: dataType.find((v) => v.DTypeName === "String")?.DTypeID ?? "",
          DTypeValue: undefined,
          MaxLength: undefined,
          MinLength: undefined,
        }
        : BaseFormState;

      state.subForms = state.subForms.map((sub) => {
        if (sub.SFormID === formData.SFormID) {
          const addField = {
            ...formData,
            DisplayOrder: (sub.Fields?.length || 0) + 1,
            CListName: checkList.find((v) => v.CListID === formData.CListID)?.CListName,
            CTypeName: checkListType.find((v) => v.CTypeID === formData.CTypeID)?.CTypeName,
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
    },
    updateField: (state, action: PayloadAction<{
      BaseFormState: BaseFormState;
      checkList: Checklist[];
      checkListType: CheckListType[];
      dataType: DataType[];
    }>) => {
      const { BaseFormState, checkList, checkListType } = action.payload;

      // state.subForms = state.subForms.map((sub) => {
      //   if (sub.subFormId === BaseFormState.subFormId) {
      //     const updatedFields = sub.fields.map((field) => {
      //       if (field.matchCheckListId === BaseFormState.matchCheckListId) {
      //         return {
      //           ...BaseFormState,
      //           displayOrder: field.displayOrder,
      //           CheckListName:
      //             checkList.find((v) => v.checkListId === BaseFormState.checkListId)?.CListName || "",
      //           CTypeName:
      //             checkListType.find((v) => v.checkListTypeId === BaseFormState.checkListTypeId)?.CTypeName || "",
      //         };
      //       }
      //       return field;
      //     });

      //     sortFields(updatedFields);

      //     return {
      //       ...sub,
      //       fields: updatedFields,
      //     };
      //   }
      //   return sub;
      // });
      sortSubForms(state.subForms);
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
            fields: subForm.Fields?.filter((f) => f.MCListID !== MCListID),
          };
        }
        return subForm;
      });
      sortSubForms(state.subForms);
    },
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
  addField,
  updateField,
  deleteField,
  // setExpected,
  reset,
} = subFormSlice.actions;

export default subFormSlice.reducer;

console.log("slices/forms");

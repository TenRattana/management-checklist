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
    updateForm: (state, action: PayloadAction<{ form?: BaseForm }>) => {
      console.log("setForm");

      const { form } = action.payload;

      state.FormName = form?.FormName || "";
      state.Description = form?.Description || "";
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

      state.subForms = state.subForms.map((sub) => {
        if (sub.SFormID === BaseFormState.SFormID) {
          const updatedFields = sub.Fields?.map((field) => {
            if (field.MCListID === BaseFormState.MCListID) {
              return {
                ...BaseFormState,
                displayOrder: field.DisplayOrder,
                CheckListName: checkList.find(v => v.CListID === BaseFormState.CListID)?.CListName || "",
                CTypeName: checkListType.find(v => v.CTypeID === BaseFormState.CTypeID)?.CTypeName || "",
              };
            }
            return field;
          }) || [];

          const sortedFields = sortFields(updatedFields);

          return {
            ...sub,
            Fields: sortedFields,
          };
        }
        return sub;
      });

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
            Fields: subForm.Fields?.filter((f) => f.MCListID !== MCListID),
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
    defaultDataForm: (state, action: PayloadAction<{
      item: CheckListType;
      SFormID: string;
      checkList: Checklist;
      dataType: DataType[];
    }>) => {
      const { item, SFormID, checkList, dataType } = action.payload

      console.log(item);
      console.log(SFormID);

      const formData: BaseFormState = BaseFormState.DTypeID === null
        ? {
          ...item,
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
            CListName: checkList.CListName,
            CTypeName: item.CTypeName,
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
  updateForm,
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
  defaultDataForm
} = subFormSlice.actions;

export default subFormSlice.reducer;

console.log("slices/forms");

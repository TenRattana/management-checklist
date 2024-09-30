import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Field {
  checkListId: string;
  groupCheckListOptionId: string;
  checkListTypeId: string;
  dataTypeId: string;
  dataTypeValue: string;
  subFormId: string;
  require: boolean;
  minLength: string;
  maxLength: string;
  description: string;
  placeholder: string;
  hint: string;
  displayOrder: number;
  matchCheckListId: string;
  expectedResult?: any;
}

interface SubForm {
  subFormName: string;
  subFormId: string;
  formId: string;
  columns: number;
  displayOrder: number;
  machineId: string;
  fields: Field[];
}

interface SubFormState {
  subForms: SubForm[];
}

const initialState: SubFormState = { subForms: [] };

const sortSubForms = (data: SubForm[]) => {
  data.sort((a, b) => a.displayOrder - b.displayOrder);
};

const sortFields = (fields: Field[]) => {
  fields.sort((a, b) => a.displayOrder - b.displayOrder);
};

const subFormSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setSubForm: (state, action: PayloadAction<{ subForms: SubForm[] }>) => {
      const { subForms } = action.payload;

      state.subForms = subForms.map((sub, index) => ({
        ...sub,
        columns: sub.columns,
        displayOrder: index,
      }));

      sortSubForms(state.subForms);
    },
    setField: (state, action: PayloadAction<{
      formState: Field[];
      checkList: any[];
      checkListType: any[];
    }>) => {
      const { formState, checkList, checkListType } = action.payload;

      state.subForms.forEach((sub) => {
        const matchingForm = formState.filter(
          (form) => form.subFormId === sub.subFormId
        );

        if (matchingForm.length > 0) {
          const updatedFields = matchingForm.map((v, index) => ({
            ...v,
            displayOrder: index,
            CheckListName:
              checkList.find((item) => item.checkListId === v.checkListId)?.CListName || "",
            CheckListTypeName:
              checkListType.find((item) => item.checkListTypeId === v.checkListTypeId)?.CTypeName || "",
          }));

          sub.fields = updatedFields;
          sortFields(sub.fields);
        }
      });
      sortSubForms(state.subForms);
    },
    addSubForm: (state, action: PayloadAction<{ subForm: Omit<SubForm, 'subFormId' | 'displayOrder'> }>) => {
      const { subForm } = action.payload;

      state.subForms.push({
        ...subForm,
        subFormId: String(state.subForms.length + 1),
        displayOrder: state.subForms.length + 1,
      });

      sortSubForms(state.subForms);
    },
    updateSubForm: (state, action: PayloadAction<{ subForm: SubForm }>) => {
      const { subForm } = action.payload;

      state.subForms = state.subForms.map((existingSub) => {
        if (existingSub.subFormId === subForm.subFormId) {
          return {
            ...existingSub,
            subFormName: subForm.subFormName,
            columns: subForm.columns,
            displayOrder: existingSub.displayOrder,
          };
        }
        return existingSub;
      });

      sortSubForms(state.subForms);
    },
    deleteSubForm: (state, action: PayloadAction<{ values: string }>) => {
      const { values } = action.payload;
      state.subForms = state.subForms.filter((subForm) => subForm.subFormId !== values);
    },
    addField: (state, action: PayloadAction<{
      formState: Field;
      checkList: any[];
      checkListType: any[];
    }>) => {
      const { formState, checkList, checkListType } = action.payload;

      state.subForms = state.subForms.map((sub) => {
        if (sub.subFormId === formState.subFormId) {
          const updatedFields = [
            ...sub.fields,
            {
              ...formState,
              displayOrder: sub.fields.length + 1,
              CheckListName:
                checkList.find((v) => v.checkListId === formState.checkListId)?.CListName || "",
              CheckListTypeName:
                checkListType.find((v) => v.checkListTypeId === formState.checkListTypeId)?.CTypeName || "",
            },
          ];

          sortFields(updatedFields);

          return {
            ...sub,
            fields: updatedFields,
          };
        }
        return sub;
      });
      sortSubForms(state.subForms);
    },
    updateField: (state, action: PayloadAction<{
      formState: Field;
      checkList: any[];
      checkListType: any[];
    }>) => {
      const { formState, checkList, checkListType } = action.payload;

      state.subForms = state.subForms.map((sub) => {
        if (sub.subFormId === formState.subFormId) {
          const updatedFields = sub.fields.map((field) => {
            if (field.matchCheckListId === formState.matchCheckListId) {
              return {
                ...formState,
                displayOrder: field.displayOrder,
                CheckListName:
                  checkList.find((v) => v.checkListId === formState.checkListId)?.CListName || "",
                CheckListTypeName:
                  checkListType.find((v) => v.checkListTypeId === formState.checkListTypeId)?.CTypeName || "",
              };
            }
            return field;
          });

          sortFields(updatedFields);

          return {
            ...sub,
            fields: updatedFields,
          };
        }
        return sub;
      });
      sortSubForms(state.subForms);
    },
    deleteField: (state, action: PayloadAction<{
      subFormId: string;
      field: string;
    }>) => {
      const { subFormId, field } = action.payload;

      state.subForms = state.subForms.map((subForm) => {
        if (subForm.subFormId === subFormId) {
          return {
            ...subForm,
            fields: subForm.fields.filter((f) => f.matchCheckListId !== field),
          };
        }
        return subForm;
      });
      sortSubForms(state.subForms);
    },
    setExpected: (state, action: PayloadAction<{ formData: Record<string, any> }>) => {
      const { formData } = action.payload;

      state.subForms.forEach((sub) => {
        sub.fields.forEach((field) => {
          field.expectedResult = formData[field.matchCheckListId] || null;
        });
      });
    },
    reset: () => initialState,
  },
});

export const {
  setSubForm,
  setField,
  addSubForm,
  updateSubForm,
  deleteSubForm,
  addField,
  updateField,
  deleteField,
  setExpected,
  reset,
} = subFormSlice.actions;

export default subFormSlice.reducer;

console.log("slices/forms");

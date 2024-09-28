import { createSlice } from "@reduxjs/toolkit";

const initialState = { subForms: [] };
const sort = (data) => {
  data.sort(
    (a, b) => parseInt(a.displayOrder, 10) - parseInt(b.displayOrder, 10)
  );
};

const subFormSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setSubForm: (state, action) => {
      const { subForms } = action.payload;

      state.subForms = subForms.map((sub, index) => ({
        subFormName: sub.subFormName,
        subFormId: sub.subFormId,
        formId: sub.formId,
        columns: parseInt(sub.columns, 10),
        displayOrder: parseInt(index, 10),
        machineId: sub.machineId,
        fields: sub?.fields || [],
      }));

      sort(state.subForms);
    },
    setField: (state, action) => {
      const { formState, checkList, checkListType } = action.payload;

      state.subForms.forEach((sub, index) => {
        const matchingForm = formState.filter(
          (form) => form.subFormId === sub.subFormId
        );

        if (matchingForm) {
          const update = matchingForm.map((v, index) => ({
            ...v,
            displayOrder: parseInt(index, 10),
            CheckListName:
              checkList.find((item) => item.CListID === v.checkListId)
                ?.CListName || "",
            CheckListTypeName:
              checkListType.find((item) => item.CTypeID === v.checkListTypeId)
                ?.CTypeName || "",
          }));
          state.subForms[index].fields = update;
          sort(state.subForms[index].fields);
        }
      });
    },
    addSubForm: (state, action) => {
      const { subForm } = action.payload;
      const parseColumns = parseInt(subForm.columns, 10);
      const parseDisplayOrder = parseInt(state.subForms.length + 1, 10);

      state.subForms.push({
        subFormName: subForm.subFormName,
        subFormId: parseDisplayOrder,
        formId: subForm.formId,
        columns: parseColumns,
        displayOrder: parseDisplayOrder,
        machineId: subForm.machineId,
        fields: [],
      });

      sort(state.subForms);
    },
    updateSubForm: (state, action) => {
      const { subForm } = action.payload;
      const parseColumns = parseInt(subForm.columns, 10);

      state.subForms = state.subForms.map((sub, index) => {
        if (sub.subFormId === subForm.subFormId) {
          return {
            ...sub,
            subFormName: subForm.subFormName,
            columns: parseColumns,
            displayOrder: parseInt(index, 10),
          };
        }
        return sub;
      });

      sort(state.subForms);
    },
    deleteSubForm: (state, action) => {
      const { values } = action.payload;
      state.subForms = state.subForms.filter((v) => v.subFormId !== values);
    },
    addField: (state, action) => {
      const { formState, checkList, checkListType } = action.payload;

      state.subForms = state.subForms.map((sub) => {
        if (sub.subFormId === formState.subFormId) {
          const updatedFields = [
            ...sub.fields,
            {
              ...formState,
              displayOrder: parseInt(sub.fields.length + 1, 10),
              CheckListName:
                checkList.find((v) => v.CListID === formState.checkListId)
                  ?.CListName || "",
              CheckListTypeName:
                checkListType.find(
                  (v) => v.CTypeID === formState.checkListTypeId
                )?.CTypeName || "",
            },
          ];

          sort(updatedFields);

          return {
            ...sub,
            fields: updatedFields,
          };
        }
        return sub;
      });
    },
    updateField: (state, action) => {
      const { formState, checkList, checkListType } = action.payload;

      state.subForms = state.subForms.map((sub) => {
        if (sub.subFormId === formState.subFormId) {
          const updatedFields = sub.fields.map((field, index) => {
            if (field.matchCheckListId === formState.matchCheckListId) {
              return {
                ...formState,
                displayOrder: parseInt(index, 10),
                CheckListName:
                  checkList.find((v) => v.CListID === formState.checkListId)
                    ?.CListName || "",
                CheckListTypeName:
                  checkListType.find(
                    (v) => v.CTypeID === formState.checkListTypeId
                  )?.CTypeName || "",
              };
            }
            return field;
          });

          sort(updatedFields);

          return {
            ...sub,
            fields: updatedFields,
          };
        }
        return sub;
      });
    },
    deleteField: (state, action) => {
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
    },

    setExpected: (state, action) => {
      const { formData } = action.payload;

      state.subForms.forEach((sub) => {
        sub.fields.forEach((field) => {
          field.expectedResult = formData[field.matchCheckListId] || null;
        });
      });
      return state;
    },

    reset: (state) => {
      return initialState;
    },
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

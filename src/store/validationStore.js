import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const defaultChecks = {
  nameMatch:    { status: 'PENDING', explanation: null, hindiExplanation: null, resolution: null, mismatchType: null },
  dobMatch:     { status: 'PENDING', explanation: null, hindiExplanation: null, resolution: null },
  employerExit: { status: 'PENDING', explanation: null, hindiExplanation: null, resolution: null },
  bankKyc:      { status: 'PENDING', explanation: null, hindiExplanation: null, resolution: null },
}

export const useValidationStore = create(
  persist(
    (set, get) => ({
      selectedClaimType: null,
      validationStatus: 'IDLE',
      checks: { ...defaultChecks },
      generatedDocuments: {
        jointDeclaration: null,
        employerLetter: null,
        epfigmsText: null,
      },
      // Bilingual labels are on by default; users can opt into English-only.
      showHindi: true,

      setClaimType: (type) => set({ selectedClaimType: type }),

      setValidationStatus: (status) => set({ validationStatus: status }),

      updateCheck: (checkName, data) =>
        set(state => ({
          checks: {
            ...state.checks,
            [checkName]: { ...state.checks[checkName], ...data },
          },
        })),

      setDocument: (type, content) =>
        set(state => ({
          generatedDocuments: { ...state.generatedDocuments, [type]: content },
        })),

      toggleHindi: () => set(state => ({ showHindi: !state.showHindi })),

      reset: () => set({
        selectedClaimType: null,
        validationStatus: 'IDLE',
        checks: { ...defaultChecks },
        generatedDocuments: { jointDeclaration: null, employerLetter: null, epfigmsText: null },
      }),

      getOverallResult: () => {
        const { checks } = get()
        const values = Object.values(checks)
        if (values.some(c => c.status === 'FAIL')) return 'FAIL'
        if (values.some(c => c.status === 'ADVISORY')) return 'ADVISORY'
        if (values.every(c => c.status === 'PASS')) return 'PASS'
        return 'PENDING'
      },
    }),
    {
      name: 'epfo_validation_session',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

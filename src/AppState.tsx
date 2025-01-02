import {create} from "zustand"

interface State {
    isLoggedIn: boolean
    apiPrefix: string
    sessionId: string
    setLoggedIn: (isLoggedIn: boolean) => void
    setApiPrefix: (apiPrefix: string) => void
    setSessionId: (sessionId: string) => void
}

export const useAppState = create<State>((set) => ({
    isLoggedIn: false,
    apiPrefix: localStorage.getItem("apiPrefix") || "",
    sessionId:  localStorage.getItem("sessionId") || "",
    setLoggedIn: (isLoggedIn: boolean) => set({isLoggedIn}),
    setApiPrefix: (apiPrefix: string) => set({apiPrefix}),
    setSessionId: (sessionId: string) => set({sessionId}),
}))
import { upload } from "@testing-library/user-event/dist/upload";


export const capitaliseLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


export const timedError = (updateError, type, error, delaySec) => {
    updateError(type, error)

    setTimeout(() => {
        updateError(type, error, true);
    }, delaySec * 1000);

}



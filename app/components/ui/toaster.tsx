import { 
    Toaster as ChakraToaster, 
    createToaster,
    ToastRoot,
    ToastIndicator,
    ToastTitle,
    ToastDescription,
    ToastCloseTrigger,
} from "@chakra-ui/react"

export const toaster = createToaster({
    placement: "top",
})

export function Toaster() {
    return (
        <ChakraToaster toaster={toaster}>
            {(toast) => {
                console.log("Rendering toast:", toast);
                return (
                    <ToastRoot>
                        <ToastIndicator />
                        {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
                        {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
                        <ToastCloseTrigger />
                    </ToastRoot>
                );
            }}
        </ChakraToaster>
    )
}


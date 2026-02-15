import { ref, onUnmounted } from "vue"
import { useI18n } from "vue-i18n"

interface SnackbarState {
  show: boolean
  message: string
  ids: string[]
  context: string
}

interface UseDeleteSnackbarOptions {
  timeout?: number
  onHardDelete: (ids: string[]) => Promise<void> | void
}

export const useDeleteSnackbar = (options: UseDeleteSnackbarOptions) => {
  const { t } = useI18n()
  const { timeout = 3000, onHardDelete } = options

  const snackbar = ref<SnackbarState>({
    show: false,
    message: "",
    ids: [],
    context: ""
  })

  let deleteTimeout: ReturnType<typeof setTimeout> | null = null

  const clearDeleteTimeout = () => {
    if (deleteTimeout) {
      clearTimeout(deleteTimeout)
      deleteTimeout = null
    }
  }

  const scheduleHardDelete = (ids: string[]) => {
    clearDeleteTimeout()
    deleteTimeout = setTimeout(async () => {
      await onHardDelete(ids)
      snackbar.value.show = false
      deleteTimeout = null
    }, timeout)
  }

  const showDeleteSnackbar = (ids: string[], context: string) => {
    snackbar.value = {
      show: true,
      message: t("common.messages.deleted", { count: ids.length }),
      ids: [...ids],
      context
    }
    scheduleHardDelete(ids)
  }

  const handleUndo = (onUndo: (ids: string[]) => void) => {
    clearDeleteTimeout()
    onUndo(snackbar.value.ids)
    snackbar.value.show = false
  }

  const handleConfirm = async () => {
    clearDeleteTimeout()
    await onHardDelete(snackbar.value.ids)
    snackbar.value.show = false
  }

  onUnmounted(() => {
    clearDeleteTimeout()
  })

  return {
    snackbar,
    showDeleteSnackbar,
    handleUndo,
    handleConfirm
  }
}

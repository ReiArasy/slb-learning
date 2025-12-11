import { defineStore } from "pinia";
import { ref } from "vue";

export const useGenerateQuizStore = defineStore('quiz', () => {
    // State
    const isLoading = ref(false)

    // UPDATE: Level dihapus dari state
    const savedQuiz = ref({
        questions: []
    })

    // Action: Reset State
    const resetQuiz = () => {
        // UPDATE: Reset hanya untuk questions
        savedQuiz.value = { questions: [] }
    }

    // Action: Save Quiz
    const saveGeneratedQuiz = async (payload) => {
        // 1. Validasi Payload
        if (!Array.isArray(payload) || payload.length === 0) {
            console.warn('Payload kosong atau bukan array')
            return { success: false, message: 'Tidak ada soal untuk disimpan.' }
        }

        isLoading.value = true

        try {
            // Simulasi API Delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            // UPDATE: Tidak perlu mengambil batchLevel lagi

            const newQuestions = payload.map(element => ({
                question: element.question,
                key: element.key,
                method: element.method,
            }))

            // 4. Update State (Batch Update)
            // UPDATE: Tidak perlu update savedQuiz.value.level

            // Replace data lama dengan data baru
            savedQuiz.value.questions = newQuestions

            return { success: true, message: 'Quiz berhasil disimpan ke Library!' }

        } catch (error) {
            console.error('Gagal menyimpan quiz:', error)
            return { success: false, message: 'Terjadi kesalahan sistem saat menyimpan.' }
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        savedQuiz,
        saveGeneratedQuiz,
        resetQuiz
    }
})
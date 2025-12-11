<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import api from '@/utils/api';

import ChevronLeftIcon from '@/components/shape/ChevronLeft.Icon.vue';
import InputComponent from '@/components/fields/InputComponent.vue';
import WysiwygEditorComponent from '@/components/fields/WysiwygEditorComponent.vue';
import ButtonComponent from '@/components/buttons/ButtonComponent.vue';
import QuestionBankModal from '@/components/modal/QuestionBankModal.vue';
import ConfirmComponent from '@/components/confirm/ConfirmComponent.vue';

const baseUrl = import.meta.env.VITE_APP_API_URL;

const route = useRoute();
const router = useRouter();

const isModalShowed = ref(false); // Bank Soal
const isConfirmOpen = ref(false); // Konfirmasi Submit

const name = ref('');
const description = ref('');
// Level dihapus
const errors = ref({}); // Validasi error (diubah ke object)
const isLoading = ref(false)

const showConfirmation = () => {
    isConfirmOpen.value = true;
};

// Handle Level dihapus

const handleConfirmAction = () => {
    submit(); // Panggil fungsi submit utama
    isConfirmOpen.value = false; // Tutup modal
};

const handleCancelAction = () => {
    isConfirmOpen.value = false; // Tutup modal
};

const submit = async () => {
    errors.value = {}; // Reset errors
    isLoading.value = true

    // Kirim data ke API
    await api.post(`/exercise`, {
        childrenId: route.params.id,
        name: name.value,
        description: description.value,
        // level dihapus dari payload
    }).then(res => {
        router.push({ name: 'childs.detail', params: route.params.id });
    }).catch(e => {
        if (e.status === 422) errors.value = e.response.data.errors;
    }).finally(() => {
        isLoading.value = false
    })
};
</script>

<template>
    <div class="container">
        <ConfirmComponent v-if="isConfirmOpen" title="Simpan latihan?"
            message="Apakah Anda yakin untuk menyimpan latihan?" confirmText="Simpan" cancelText="Batal"
            @confirm="handleConfirmAction" @cancel="handleCancelAction" :isBtnLoading="isLoading" />

        <QuestionBankModal v-if="isModalShowed" :questions="questionBank" :method="method"
            :methodLabel="methodLabel.label" :questionType="objectValue" :insertQuestion="insertQuestion"
            :handleQuestionBank="handleQuestionBank" />
        <div class="page-header exercise">
            <router-link :to="{ name: 'childs.detail', params: route.params.id }">
                <ChevronLeftIcon />
            </router-link>
            <h1 class="page-title">Buat Latihan Baru</h1>
        </div>
        <div class="page-body">
            <div class="form">

                <input-component label="Judul Latihan" :required="true" type="text" placeholder="Judul latihan"
                    id="name" class="input" v-model="name" :isInvalid="errors?.name ?? false"
                    :invalidMsg="errors?.name ?? ''" />

                <div class="input-wrapper">
                    <label for="editor">Deskripsi</label>
                    <WysiwygEditorComponent v-model="description" class="textarea" />
                </div>

                <ButtonComponent :isDisabled="isLoading" :label="isLoading ? 'Loading...' : 'Simpan'" size="full"
                    class="secondary" @click="showConfirmation" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
/* START STYLES */

/* --- Input Umum --- */
.input {
    margin-bottom: 30px;
}

.textarea {
    margin-bottom: 50px;
}

// Style ini sepertinya tidak terpakai karena Anda menggunakan WysiwygEditorComponent
// Tapi saya biarkan jika Anda membutuhkannya
textarea.textarea {
    margin: auto;
    width: 100%;
    min-height: 50vh;
    border: 1px solid black;
    outline: none;
    border-radius: 10px;
    padding: 15px;
    background: unset;
}

.input-flex {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 20px;
}

/* --- End Input Umum --- */

/* --- Wrapper Input --- */
.input-wrapper {
    margin-bottom: 30px;

    label {
        color: var(--Neutral-700);
        display: block;
        font-weight: 500;
        margin-bottom: 10px;
        font-size: medium;
    }
    
    // Level wrapper styles dihapus
}
</style>
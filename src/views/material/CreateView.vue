<script setup>
import ChevronLeftIcon from '@/components/shape/ChevronLeft.Icon.vue';
import InputComponent from '@/components/fields/InputComponent.vue';
import WysiwygEditorComponent from '@/components/fields/WysiwygEditorComponent.vue';
import FileUploadComponent from '@/components/fields/FileUploadComponent.vue';
import ButtonComponent from '@/components/buttons/ButtonComponent.vue';
import CheckboxesComponent from '@/components/fields/CheckboxesComponent.vue';

import api from '@/utils/api';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()
const isLoading = ref(false)

const title = ref('')
const description = ref('')
const link = ref('')
const files = ref([])
const content = ref('')
const readedText = ref('')

// Menggabungkan semua metode menjadi satu list statis
const availableMethods = [
    { label: 'Mendengar Audio', value: 1 },
    { label: 'Menulis Ulang', value: 2 },
    { label: 'Membaca', value: 3 },
    { label: 'Mengurut Kata', value: 4 },
    { label: 'Menebak Cepat', value: 5 },
    { label: 'Aritmatika', value: 6 },
]

const method = ref(null)
const errors = ref([])

const handleMethod = (val) => {
    method.value = val
}

const submit = async () => {
    errors.value = null
    isLoading.value = true

    const formData = new FormData()
    formData.append('childrenId', route.params.id)
    formData.append('title', title.value)

    // Level dihapus dari append
    if (description.value) formData.append('description', description.value)
    if (method.value) formData.append('method', method.value)
    if (content.value) formData.append('content', content.value)
    if (readedText.value) formData.append('readedText', readedText.value)
    if (link.value) formData.append('link', link.value)

    if (files.value && files.value.length > 0) {
        for (let i = 0; i < files.value.length; i++) {
            formData.append('images', files.value[i])
        }
    }

    await api.post(`/materials`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(res => {
        router.push({ name: 'childs.detail', params: { id: route.params.id } })
    }).catch(e => {
        if (e.response && e.response.status === 422) {
            errors.value = e.response.data.errors
        } else {
            console.error(e)
        }
    }).finally(() => {
        isLoading.value = false
    })
}
</script>

<template>
    <div class="container">
        <div class="page-header">
            <router-link :to="{ name: 'childs.detail', params: route.params.id }">
                <ChevronLeftIcon />
            </router-link>
            <h1 class="page-title">Buat Materi Baru</h1>
        </div>
        <div class="page-body">
            <div class="form">

                <div class="input-wrapper">
                    <label for="type" :class="{ 'invalid': errors?.method ?? false }">
                        Tipe Materi <span class="req">*</span>
                    </label>
                    <CheckboxesComponent :data="availableMethods" :function="handleMethod"
                        :isInvalid="errors?.method ?? false" :invalidMsg="errors?.method ?? ''" />
                </div>

                <input-component label="Judul Materi" :required="true" type="text" placeholder="Judul materi" id="title"
                    class="input" v-model="title" :isInvalid="errors?.title ?? false"
                    :invalidMsg="errors?.title ?? ''" />

                <div class="input-wrapper">
                    <label for="editor">Deskripsi</label>
                    <WysiwygEditorComponent v-model="description" class="textarea" />
                </div>

                <input-component label="Tautan Materi Video" type="text" placeholder="Tautan materi video" id="link"
                    class="input" v-model="link" :isInvalid="errors?.link ?? false" :invalidMsg="errors?.link ?? ''" />

                <input-component label="Materi Suara *Materi akan otomatis terbaca oleh AI" type="text"
                    placeholder="Masukkan materi yang akan dibaca oleh AI" id="readedText" class="input"
                    v-model="readedText" :isInvalid="errors?.readedText ?? false"
                    :invalidMsg="errors?.readedText ?? ''" />

                <div class="input-wrapper">
                    <label for="editor">Materi Tulis</label>
                    <WysiwygEditorComponent v-model="content" class="textarea" />
                </div>

                <div class="input-wrapper">
                    <label for="file">Gambar Media Pembelajaran</label>
                    <FileUploadComponent v-model="files" :id="'files'" :infoText="'Upload materi pembelajaran'"
                        class="input" :isMultiple="true" />
                </div>

                <ButtonComponent :isDisabled="isLoading" :label="isLoading ? 'Loading...' : 'Simpan'" size="full"
                    @click="submit" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.input {
    margin-bottom: 30px;
}

.textarea {
    margin-bottom: 50px;
}

.input-wrapper {
    margin-bottom: 30px;

    label {
        color: var(--Neutral-700);
        display: block;
        font-weight: 500;
        margin-bottom: 10px;
        font-size: medium;
    }

    // Style khusus validasi checkbox
    label.invalid {
        color: var(--Danger-900, #CC1D1D);
    }
}

/* Responsive */
@media (max-width: 576px) {
    .input {
        margin-bottom: 20px;
    }

    .textarea {
        margin-bottom: 30px;
    }

    .input-wrapper {
        margin-bottom: 20px;
    }
}
</style>
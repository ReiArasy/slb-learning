<script setup>
import ChevronLeftIcon from '@/components/shape/ChevronLeft.Icon.vue';
import InputComponent from '@/components/fields/InputComponent.vue';
import WysiwygEditorComponent from '@/components/fields/WysiwygEditorComponent.vue';
import FileUploadComponent from '@/components/fields/FileUploadComponent.vue';
import ButtonComponent from '@/components/buttons/ButtonComponent.vue';
import CheckboxesComponent from '@/components/fields/CheckboxesComponent.vue';

import api from '@/utils/api';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const baseUrl = import.meta.env.VITE_APP_API_URL
const route = useRoute()
const router = useRouter()
const id = route.params.id
const materialId = route.params.materialId

// --- STATE VARIABLES ---
const title = ref('')
const description = ref('')
const content = ref('')
const readedText = ref('')
const link = ref('')
const files = ref([])
const oldImages = ref([])
const errors = ref([])
const isLoading = ref(false)

// --- LOGIC METHOD (Level Dihapus) ---
const method = ref(null)

// Daftar Metode Flat
const availableMethods = [
    { label: 'Mendengar Audio', value: 1 },
    { label: 'Menulis Ulang', value: 2 },
    { label: 'Membaca', value: 3 },
    { label: 'Mengurut Kata', value: 4 },
    { label: 'Menebak Cepat', value: 5 },
    { label: 'Aritmatika', value: 6 }, // <--- Method Baru
]

const handleMethod = (val) => {
    method.value = val
}

// --- FETCH DATA (EDIT MODE) ---
onMounted(async () => {
    await api.get(`materials/${route.params.materialId}`)
        .then(res => {
            const data = res.data.data

            title.value = data.title
            description.value = data.description
            content.value = data.content
            readedText.value = data.readedText
            link.value = data.link
            // level.value = data.level // <--- DIHAPUS
            method.value = data.method

            // Handle Images
            oldImages.value = data.images
        }).catch(e => {
            console.log(e);
        })
})

// --- SUBMIT DATA ---
const submit = async () => {
    errors.value = null
    isLoading.value = true

    const formData = new FormData()
    formData.append('childrenId', route.params.id)
    formData.append('title', title.value)

    if (description.value) formData.append('description', description.value)
    if (content.value) formData.append('content', content.value)
    if (readedText.value) formData.append('readedText', readedText.value)
    // if (level.value) formData.append('level', level.value) <--- DIHAPUS
    if (method.value) formData.append('method', method.value)
    if (link.value) formData.append('link', link.value)

    if (files.value && files.value.length > 0) {
        for (let i = 0; i < files.value.length; i++) {
            formData.append('images', files.value[i])
        }
    }

    await api.put(`/materials/${materialId}`, formData, {
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
            <router-link :to="{ name: 'material.overview', params: { id, materialId } }">
                <ChevronLeftIcon />
            </router-link>
            <h1 class="page-title">Edit Materi</h1>
        </div>
        <div class="page-body">
            <div class="form">

                <div class="input-wrapper">
                    <label for="type" :class="{ 'invalid': errors?.method }">Tipe Materi <span
                            class="req">*</span></label>
                    <CheckboxesComponent :data="availableMethods" :function="handleMethod" :selectedValue="method"
                        :isInvalid="errors?.method ?? false" :invalidMsg="errors?.method ?? ''" />
                </div>

                <input-component label="Judul Materi" :required="true" type="text" placeholder="Judul materi" id="title"
                    class="input" v-model="title" :isInvalid="errors?.title ?? false"
                    :invalidMsg="errors?.title ?? ''" />

                <div class="input-wrapper">
                    <label for="editor-desc">Deskripsi</label>
                    <WysiwygEditorComponent v-model="description" class="textarea" />
                </div>

                <input-component label="Tautan Materi Video" type="text" placeholder="Tautan materi video" id="link"
                    class="input" v-model="link" :isInvalid="errors?.link ?? false" :invalidMsg="errors?.link ?? ''" />

                <input-component label="Materi Suara *Materi akan otomatis terbaca oleh AI" type="text"
                    placeholder="Masukkan materi yang akan dibaca oleh AI" id="readedText" class="input"
                    v-model="readedText" :isInvalid="errors?.readedText ?? false"
                    :invalidMsg="errors?.readedText ?? ''" />

                <div class="input-wrapper">
                    <label for="editor-content">Materi Tulis</label>
                    <WysiwygEditorComponent v-model="content" class="textarea" />
                </div>

                <div class="input-wrapper">
                    <div v-if="oldImages && oldImages.length > 0">
                        <label for="oldImg">Gambar Saat Ini :</label>
                        <div class="old-images-container" id="oldImg">
                            <img :src="`${baseUrl}/api/v1/${item}`" alt="Material Image"
                                v-for="(item, index) in oldImages" :key="index">
                        </div>
                    </div>

                    <label for="file">Gambar Media Pembelajaran (Upload untuk menambah/mengganti)</label>
                    <file-upload-component v-model="files" :id="'files'" :infoText="'Upload materi pembelajaran'"
                        class="input" :isMultiple="true" />
                </div>

                <ButtonComponent :isDisabled="isLoading" :label="isLoading ? 'Loading...' : 'Simpan Perubahan'"
                    size="full" @click="submit" />
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

    .old-images-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 10px;
        margin-bottom: 20px;

        img {
            width: 100%;
            height: 100px;
            object-fit: cover;
            border-radius: 10px;
            border: 1px solid var(--Neutral-200);
        }
    }

    // Level styles dihapus
}
</style>
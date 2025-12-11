<script setup>
import ButtonComponent from '@/components/buttons/ButtonComponent.vue';
import InputComponent from '@/components/fields/InputComponent.vue';
import child from '@/assets/images/child.png'
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import api from '@/utils/api';

const router = useRouter()

const fullName = ref('')
const errors = ref([])

async function submit() {
    errors.value = null
    await api.post(`/childs`, {
        fullName: fullName.value,
        // isScreening & level dihapus
    }).then((res) => {
        router.push({ name: 'childs.index' })
    }).catch((e) => {
        if (e.status === 422) errors.value = e.response.data.errors
    })
}
</script>

<template>
    <div class="container">
        <div class="page-header">
            <h1 class="page-title">Tambah Data Anak</h1>
            <button-component label="Kembali" size="small" display="border"
                @click="router.push({ name: 'childs.index' })" />
        </div>
        <div class="page-body">
            <div class="card">
                <div class="card-body">
                    <img :src="child" alt="Child">
                    <div class="form">
                        <input-component label="Nama Anak" type="text" placeholder="Contoh: Budi Pratama" id="fullName"
                            class="input" v-model="fullName" :isInvalid="errors?.fullName ?? false"
                            :invalidMsg="errors?.fullName ?? ''" />

                        <button-component label="Simpan" size="full" @click="submit" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.card {
    background-color: var(--White);
    padding: 3rem;
    border-radius: 20px;
    box-shadow: 0 5.192px 31.153px 0 rgba(0, 0, 0, 0.25);

    .card-body {
        display: grid;
        grid-template-columns: 30% 70%;
        gap: 40px; // Jarak diperbesar sedikit agar seimbang
        align-items: center;

        img {
            width: 100%;
            max-width: 350px;
            justify-self: center;
        }

        .form {
            display: flex;
            flex-direction: column;
            gap: 20px; // Jarak antar input dan tombol
        }

        // Style input-wrapper level dihapus
    }
}

/* --- RESPONSIVE --- */

@media (max-width: 992px) {
    .card {
        padding: 2rem;

        .card-body {
            grid-template-columns: 1fr;
            gap: 40px;

            img {
                max-width: 250px;
                order: -1;
            }
        }
    }
}

@media (max-width: 576px) {
    .card {
        padding: 1.5rem;
        border-radius: 15px;
    }
}
</style>
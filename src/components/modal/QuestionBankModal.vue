<script setup>
import { onMounted, ref, watch } from 'vue';
import InputComponent from '../fields/InputComponent.vue';
import ButtonComponent from '../buttons/ButtonComponent.vue';
import api from '@/utils/api';
import { formatDate } from '@/helpers/formatDate';

const search = ref()

const baseUrl = import.meta.env.VITE_APP_API_URL
// LEVEL DIHAPUS DARI PROPS
const props = defineProps(['method', 'methodLabel', 'questionType', 'insertQuestion', 'handleQuestionBank'])
const questionBank = ref([])

onMounted(async () => {
    // LEVEL DIHAPUS DARI QUERY PARAMS API
    await api.get(`/questions?method=${props.method}`)
        .then(res => {
            questionBank.value = []
            questionBank.value = res.data.data

            // Filter khusus untuk Method 5 (Tebak Cepat)
            if (props.method == 5 && props.questionType == 1) {
                // Tipe Hex (Warna)
                questionBank.value = res.data.data.filter(d => d.question.type == 'hex')
            } else if (props.method == 5 && props.questionType == 2) {
                // Tipe Path (Gambar Objek)
                questionBank.value = res.data.data.filter(d => d.question.type == 'path')
            }

            // Untuk Method 6 (Aritmatika) dan lainnya, akan mengambil semua data sesuai method tanpa filter type tambahan

        }).catch(e => {
            console.log(e);
        })
})
</script>

<template>
    <div class="modal-container">
        <div class="modal">
            <button class="modal-close" @click="props.handleQuestionBank()">X</button>
            <div class="modal-header">
                <InputComponent v-model="search" label="Cari Data Soal" type="text" placeholder="Cari Data Soal" />
            </div>
            <div class="modal-body">
                <div class="questions-container">
                    <div class="question-item" v-for="(item, index) in questionBank" :key="index">
                        <div class="question-header">
                            <img :src="`${baseUrl}/api/v1/${item?.question?.value}`" alt="Pertanyaan"
                                v-if="item?.question?.type == 'path'">

                            <div v-else-if="item?.question?.type == 'hex'"
                                :style="`width: 100%; height: 100px; background-color: ${item?.question?.value}; border-radius: 10px; border: 1px solid #ccc;`">
                            </div>

                            <h2 class="question" v-else>{{ item?.question?.value }}</h2>

                            <p class="date">{{ formatDate(item?.createdAt) }}</p>
                        </div>
                        <div class="question-body">
                            <p class="key">Kunci : {{ item?.key }}</p>
                        </div>
                        <div class="question-footer">
                            <div class="method">{{ methodLabel }}</div>
                            <div class="action">
                                <ButtonComponent label="Gunakkan" class="secondary" display="border" size="small"
                                    @click="props.insertQuestion(item)" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.modal-container {
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    width: 100%;
    height: 100%;

    &::before {
        position: absolute;
        top: 0;
        left: 0;
        content: '';
        width: 100%;
        height: 100%;
        background-color: black;
        opacity: 20%;
    }

    .modal {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--White);
        padding: 50px;
        border-radius: 20px;
        width: 85vw;
        height: 90vh;
        z-index: 10;

        .modal-close {
            position: absolute;
            top: 30px;
            right: 30px;
            background: unset;
            border: 2px solid var(--Secondary-900);
            outline: 0;
            font-size: 15px;
            font-weight: bold;
            color: var(--Secondary-900);
            padding: 5px 10px;
            border-radius: 100px;
            cursor: pointer;
        }

        .modal-header {
            margin-bottom: 30px;
        }

        .modal-body {
            overflow-y: scroll;
            height: 60vh;
            padding-right: 15px;

            .questions-container {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;

                .question-item {
                    color: var(--Secondary-900);
                    border: 2px solid var(--Secondary-900);
                    padding: 10px;
                    border-radius: 5px;

                    img {
                        width: 50%;
                        border-radius: 10px;
                    }
                }

                .question-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                    margin-bottom: 10px;
                    gap: 10px; // Tambahan agar teks dan tanggal tidak nempel

                    .question {
                        font-size: 1.2rem;
                        font-weight: bold;
                    }
                }

                .question-body {
                    margin-bottom: 10px;
                }

                .question-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    .method {
                        padding: 5px 15px;
                        background-color: var(--Secondary-900);
                        border-radius: 10px;
                        color: var(--White);
                        font-size: small;
                    }

                    .action {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 5px;
                    }
                }
            }
        }
    }
}

/* Responsive */
@media (max-width: 1024px) {
    .modal-container .modal .modal-body .questions-container {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 576px) {
    .modal-container .modal .modal-body .questions-container {
        grid-template-columns: 1fr;
    }

    .modal-container .modal {
        padding: 30px 20px;
        width: 95vw;
    }
}
</style>
<script setup>
import HorrayComponent from '@/components/alerts/HorrayComponent.vue';
import ButtonComponent from '@/components/buttons/ButtonComponent.vue';
import ChevronLeftIcon from '@/components/shape/ChevronLeft.Icon.vue';
import HorrayIcon from '@/components/shape/HorrayIcon.vue';
import { formatDate } from '@/helpers/formatDate';
import { useQuizStore } from '@/stores/quiz';
import api from '@/utils/api';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Vue3Lottie } from 'vue3-lottie';
import horrayAnimation from '../../assets/images/horray_animation.json'


const isShowHorray = ref(true)
const route = useRoute()
const router = useRouter()
const data = ref([])
const id = route.params.id
const quizId = route.params.quizId
const correctAnswer = ref(0)
const isLoading = ref(false)

onMounted(async () => {
    api.get(`/exercise/${id}/quiz/${quizId}`)
        .then((res) => {
            isLoading.value = true
            data.value = res.data.data

            // Menghitung jawaban benar berdasarkan similarityPoint
            // Ini berlaku generic untuk semua method termasuk Aritmatika
            data.value.answers.map(d => {
                if (d.similarityPoint > 0) correctAnswer.value++
            })
        })
        .catch((err) => {
            console.log(err);
        }).finally(() => {
            isLoading.value = false
        })
})
</script>

<template>

    <HorrayComponent @close="isShowHorray = false" v-if="isShowHorray" />
    <div class="container">
        <div class="page-header">
            <router-link :to="{ name: 'exercise.quiz.list', params: { id: id } }">
                <ChevronLeftIcon />
            </router-link>
            <h1 class="page-title">Hasil Latihan</h1>
        </div>
        <div class="page-body">
            <div class="card">
                <div class="card-header">
                    <h3>{{ data?.name }}</h3>
                </div>
                <div v-if="isLoading" class="loading-state" style="background: unset;">
                    <div class="spinner" style="border-top-color: var(--Secondary-900);"></div>
                    <p>Sedang mengambil data...</p>
                </div>
                <div class="card-body" v-else>
                    <div class="description">
                        <div v-html="data?.description"></div>
                    </div>
                    <div class="data">
                        <div class="date">Tanggal Dikerjakan : <span>{{ formatDate(data?.date) }}</span></div>
                        <div class="questionTotal">Jumlah Soal : <span>{{ data?.questions?.length }} Soal</span></div>
                        <div class="point">Poin Lolos : <span>60 Poin</span></div>
                    </div>
                    <div class="summary-data">
                        <p>Perolehan Poin : <span>{{ data?.quizPoint }} Poin</span></p>
                        <p>Soal Dikerjakan : <span>{{ data?.answers?.length }} Soal</span></p>
                        <p>Soal Tidak Dikerjakan : <span>{{ data?.questions?.length - data?.answers?.length }}
                                Soal</span></p>
                        <br>
                        <p>Soal Benar : <span>{{ correctAnswer }}
                                Soal</span></p>
                        <p>Soal Salah : <span>{{ data?.answers?.length - correctAnswer }}
                                Soal</span></p>
                        <h1 v-html="data?.quizPoint >= 60 ? 'Lulus' : 'Tidak Lulus'"></h1>
                    </div>
                    <div class="action">
                        <Vue3Lottie style="width: 60%;" :animationData="horrayAnimation" :loop="true"
                            :autoPlay="true" />
                        <div class="btn-group">
                            <ButtonComponent label="Coba Lagi" display="border" class="secondary"
                                @click="router.push({ name: 'exercise.quiz.overview', params: { id: id, quizId: quizId } })" />
                            <ButtonComponent label="Selesai" class="secondary"
                                @click="router.push({ name: 'exercise.quiz.list', params: { id: id } })" />
                        </div>
                        <ButtonComponent label="Penilaian Perilaku" class="secondary" display="border"
                            @click="router.push({ name: 'exercise.attitude', params: { id: route.params.id, quizId: quizId } })"
                            size="full" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.page-header {
    h1 {
        color: var(--Secondary-900) !important;
    }

    svg path {
        fill: var(--Secondary-900) !important;
    }
}

.page-body {
    h3 {
        color: var(--Secondary-900);
        font-size: 30px;
        text-transform: capitalize;
    }

    .card {
        padding: 5rem;
        border-radius: 10px;
        background-color: var(--White);
        box-shadow: 0 5.192px 31.153px 0 rgba(0, 0, 0, 0.25);

        .card-header {
            display: flex; // Ubah dari Grid ke Flex karena Level dihapus
            justify-content: center; // Judul di tengah (opsional, bisa start)
            align-items: center;
            margin-bottom: 40px;
            
            // Level container styles dihapus
        }

        .card-body {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            position: relative;
            margin-bottom: 40px;

            .description {
                font-size: 20px;
                color: var(--Neutral-700);

                :deep(p) {
                    margin-bottom: 1rem;
                }

                :deep(ul) {
                    padding-left: 20px;
                }
            }

            .data {
                justify-items: end;
                width: 100%;
                text-align: justify;
                color: var(--Secondary-900);
                font-size: 25px;

                .date,
                .questionTotal,
                .point {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    margin-bottom: 5px;

                    span {
                        font-weight: bold;
                    }
                }
            }

            .summary-data {
                p {
                    color: var(--Secondary-900);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 25px;
                    margin-bottom: 5px;

                    span {
                        font-size: 25px;
                        font-weight: bold;
                    }
                }

                h1 {
                    font-size: 50px;
                    color: var(--Primary-900);
                    margin-top: 30px;
                }
            }

            .action {
                display: flex;
                flex-direction: column;
                justify-content: space-between;

                .icon {
                    width: 100%;
                }

                .btn-group {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 30px;
                }
            }
        }

        .card-footer {
            hr {
                border: 1px solid var(--Secondary-900);
                margin: 10px 0;
            }

            .quiz-container {
                .nodata {
                    text-align: center;
                    color: var(--Secondary-900);
                    font-size: 20px;
                }
            }
        }
    }
}


/* --- RESPONSIVE --- */

/* Target Tablet (Large) */
@media (max-width: 1024px) {
    .page-body .card {
        padding: 3rem;

        .card-header {
            // Level styles dihapus
            justify-content: start; // Di mobile rata kiri biasanya lebih rapi
        }

        .card-body {
            grid-template-columns: 1fr;
            gap: 30px;

            .action {
                .icon {
                    max-width: 300px;
                    align-self: center;
                    order: -1;
                    margin-bottom: 30px;
                }

                .btn-group {
                    margin-bottom: 15px;
                }
            }
        }
    }
}

/* Target Ponsel */
@media (max-width: 576px) {
    .page-body {
        h3 {
            font-size: 24px;
        }

        .card {
            padding: 1.5rem;

            // Level responsive styles dihapus

            .card-body {
                gap: 40px;

                .description,
                .data,
                .summary-data p {
                    font-size: 16px;
                }

                .data span,
                .summary-data p span {
                    font-size: 16px;
                }

                .summary-data h1 {
                    font-size: 32px;
                }

                .action {
                    .btn-group {
                        flex-direction: column;
                        width: 100%;

                        button {
                            width: 100%;
                        }
                    }
                }
            }
        }
    }
}
</style>
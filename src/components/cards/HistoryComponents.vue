<script setup>
import ButtonComponent from '@/components/buttons/ButtonComponent.vue'
import { formatDate } from '@/helpers/formatDate'

// props dari parent
const props = defineProps({
    items: {
        type: Array,
        default: () => []
    }
})
</script>


<template>
  <div class="history">
    <h4>Riwayat Pengerjaan</h4>
    <hr />

    <div class="history-body">
      <div v-if="!items || items.length === 0" class="no-history">
        Belum Ada Riwayat Pengerjaan
      </div>

      <div class="history-list">
        <div 
          class="history-item"
          v-for="(ans, idx) in items" 
          :key="idx"
        >
          <!-- LEFT -->
          <div class="history-left">
            <div class="point">{{ ans.point ?? 0 }} Poin</div>

            <div class="meta-group">
              <div class="meta done">
                Soal Dikerjakan : {{ ans.answeredCount ?? 0 }}
              </div>
              <div class="meta not-done">
                Soal Tidak Dikerjakan :
                {{ (ans.totalQuestions ?? 0) - (ans.answeredCount ?? 0) }}
              </div>
            </div>
          </div>

          <!-- RIGHT -->
          <div class="history-right">
            <div class="date">
              Tanggal: {{ formatDate(ans.createdAt) }}
            </div>

            <ButtonComponent
              label="Lihat Laporan Perilaku"
              class="secondary"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.history {
    grid-column: 1 / -1;
    margin-top: 28px;

    h4 {
        margin-bottom: 6px;
        color: var(--Secondary-900);
    }

    hr {
        height: 1px;
        background: var(--Secondary-900);
        border: 0;
        margin-bottom: 16px;
    }

    .no-history {
        text-align: center;
        padding: 18px 0;
        color: var(--Secondary-900);
    }

    /* LIST */
    .history-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    /* ITEM */
    .history-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border: 2px solid #0095e8;
        border-radius: 16px;
        background: #fff;
        gap: 20px;

        /* LEFT SIDE */
        .history-left {
            display: flex;
            flex-direction: column;
            gap: 6px;

            .point {
                font-size: 26px;
                font-weight: 700;
                color: #0075c9;
            }

            .meta-group {
                display: flex;
                flex-direction: column;
                gap: 2px;

                .meta {
                    font-size: 13px;

                    &.done {
                        color: #0075c9;
                    }

                    &.not-done {
                        color: #e54848;
                        font-weight: 600;
                    }
                }
            }
        }

        .history-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 10px;

            .date {
                color: #0075c9;
                font-size: 14px;
                font-weight: 600;
            }

            button {
                width: auto;
            }
        }
    }

    /* block */
    @media (max-width: 768px) {
        .history-item {
            flex-direction: column;
            align-items: flex-start;

            .history-right {
                align-items: flex-start;
                width: 100%;

                button {
                    width: 100%;   
                }
            }
        }
    }
}
</style>
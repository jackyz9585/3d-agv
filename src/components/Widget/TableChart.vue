<template>
  <div class="main-table">
    <table
      cellspacing="0"
      cellpadding="0"
      :class="['main-table-header', hasScollBar ? 'has-scollbar' : '']"
    >
      <thead>
        <tr>
          <th v-for="header in TableChartData.headers" :key="header.value">
            <div class="cell" :style="{ width: `${header.width}px` }">
              {{ header.name }}
            </div>
          </th>
        </tr>
      </thead>
    </table>
    <div class="main-table-body">
      <table cellspacing="0" cellpadding="0">
        <tbody>
          <tr v-for="(item, index) in TableChartData.data" :key="index">
            <td v-for="header in TableChartData.headers" :key="header.value">
              <div class="cell" :style="{ width: `${header.width}px` }">
                {{ item[header.value] }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { getTableChartData } from '@/server/publicApi'

export default {
  name: 'TableChart',
  data() {
    return {
      TableChartData: {
        headers: [],
        data: [],
      },
      hasScollBar: false,
      totalWidth: 0,
    }
  },
  mounted() {
    const resizeFn = () => {
      this.$nextTick(() => {
        this.calcTableHeaderWidth()
      })
    }
    window.addEventListener('resize', resizeFn)
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', resizeFn)
    })
  },

  methods: {
    renderChart(data) {
      this.TableChartData = data
      this.$nextTick(() => {
        this.calcTableHeaderWidth()
        this.scrollToBottom()
      })
    },
    calcTableHeaderWidth() {
      this.$nextTick(() => {
        // 获取表格宽度
        const tableBody = document.querySelector('.main-table-body')
        const sumWidth = tableBody.clientWidth
        // 根据比例重分配每列宽度
        const headers = this.TableChartData.headers
        const totalWidth = headers.reduce((total, item) => {
          return total + item.width
        }, 0)
        // 重置每列宽度
        headers.forEach((item) => {
          item.width = (item.width / totalWidth) * sumWidth
        })
      })
    },

    // 滚动到底部，给标识位赋值
    scrollToBottom() {
      const tableBody = document.querySelector('.main-table-body')
      //获取tableBody下的table
      const table = tableBody.querySelector('table')
      //获取tableBody的高度
      const tableBodyHeight = tableBody.clientHeight
      //获取table的高度
      const tableHeight = table.clientHeight
      //如果table的高度大于tableBody的高度，说明有滚动条，需要滚动到最底部
      if (tableHeight > tableBodyHeight) {
        // 滚动到最底部
        tableBody.scrollTop = tableHeight
        this.hasScollBar = true
        // console.log('有滚动条')
      } else {
        this.hasScollBar = false
        // console.log('没有滚动条')
      }
    },
  },
}
</script>

<style scoped lang="scss">
.main-table {
  width: 100%;
  height: 100%;
  color: #38ffff;
  // box-shadow: #2d89fe 0px 0px 5px;
  text-align: center;
  font-size: 0.25rem;

  display: flex;
  flex-direction: column;
  table {
    width: 100%;
  }
  td,
  th {
    text-shadow: 2px 2px 5px #01ffff;
    .cell {
      padding: 0.1rem;
      box-sizing: border-box;
      // // 超出显示省略号
      // overflow: hidden;
      // text-overflow: ellipsis;
      // white-space: nowrap;
    }
  }
  td {
    font-size: 0.25rem;
    color: #feffff;
  }
  &-header.has-scollbar {
    width: calc(100% - 10px);
  }
  &-body {
    overflow-y: auto;
  }
}
</style>

import React from 'react'
import { Typography, Progress, Table } from 'antd'
import { red, yellow, green, cyan } from '@ant-design/colors'
import { inflateRaw } from 'pako/dist/pako_inflate.js'

const { Link } = Typography

const inflateData = str => {
  return JSON.parse(inflateRaw(new Uint8Array(str.split(',')), { to: 'string' }))
}

window.OriginalStatsData = window.StatsData

window.StatsData = inflateData(window.OriginalStatsData)

const { StatsData } = window
const { Summary, Details } = StatsData

export { StatsData }

export const add = (a, b) => a + b

export const map = (arr, key) => {
  return arr.map(v => v[key])
}

const ColorsMap = {
  low: red[2],
  medium: yellow[2],
  high: green[2]
}

const ProgressColorsMap = {
  low: red.primary,
  medium: yellow.primary,
  high: green.primary
}

const MetricsRender = value => {
  const { covered, total } = value
  return [covered, '/', total].join('')
}

export const MetricsPctRender = value => {
  return [value, '%'].join('')
}

export const MetricsSummaryRender = (type, isRender = true) => {
  const list = map(map(Summary, 'metrics'), type)
  const covered = map(list, 'covered').reduce(add, 0)
  const total = map(list, 'total').reduce(add, 0)
  const pct = +((covered / total) * 100).toFixed(2)
  const record = {
    covered,
    total,
    pct
  }
  if (isRender) {
    return MetricsRender(record)
  }
  return record
}

const getOnCell = dataIndex => {
  return record => {
    const reportClasse = record.reportClasses[dataIndex]
    return {
      style: {
        background: ColorsMap[reportClasse]
      }
    }
  }
}

const maxFileLength = Math.max(...map(Object.keys(Details), 'length'))

export const columns = [
  {
    title: 'File',
    dataIndex: 'file',
    width: (Math.max(7, maxFileLength) + 2) * 8,
    render: value => {
      return <Link href={`#${value}`}>{value}</Link>
    },
    onCell: getOnCell('statements')
  },
  {
    title: '',
    width: 100,
    dataIndex: ['metrics', 'statements', 'pct'],
    render: (value, record) => {
      const { statements: reportClasse } = record.reportClasses
      return (
        <Progress
          percent={value}
          showInfo={false}
          status="active"
          strokeLinecap="square"
          strokeColor={ProgressColorsMap[reportClasse]}
          trailColor="#fff"
        />
      )
    },
    onCell: getOnCell('statements')
  },
  {
    title: 'Statements',
    dataIndex: ['metrics', 'statements', 'pct'],
    render: MetricsPctRender,
    onCell: getOnCell('statements')
  },
  {
    title: '',
    dataIndex: ['metrics', 'statements'],
    render: MetricsRender,
    onCell: getOnCell('statements')
  },
  {
    title: 'Branches',
    dataIndex: ['metrics', 'branches', 'pct'],
    render: MetricsPctRender,
    onCell: getOnCell('branches')
  },
  {
    title: '',
    dataIndex: ['metrics', 'branches'],
    render: MetricsRender,
    onCell: getOnCell('branches')
  },
  {
    title: 'Functions',
    dataIndex: ['metrics', 'functions', 'pct'],
    render: MetricsPctRender,
    onCell: getOnCell('functions')
  },
  {
    title: '',
    dataIndex: ['metrics', 'functions'],
    render: MetricsRender,
    onCell: getOnCell('functions')
  },
  {
    title: 'Lines',
    dataIndex: ['metrics', 'lines', 'pct'],
    render: MetricsPctRender,
    onCell: getOnCell('lines')
  },
  {
    title: '',
    dataIndex: ['metrics', 'lines'],
    render: MetricsRender,
    onCell: getOnCell('lines')
  }
]

export const getSummary = isDetail => {
  return () => {
    if (isDetail) {
      return null
    }
    const { Row, Cell } = Table.Summary
    const { pct: statementsPct } = MetricsSummaryRender('statements', false)
    const { pct: branchesPct } = MetricsSummaryRender('branches', false)
    const { pct: functionsPct } = MetricsSummaryRender('functions', false)
    const { pct: linesPct } = MetricsSummaryRender('lines', false)
    return (
      <Row style={{ background: '#fafafa' }}>
        <Cell>Summary</Cell>
        <Cell>
          <Progress
            percent={statementsPct}
            showInfo={false}
            status="active"
            strokeColor={cyan.primary}
            trailColor="#fff"
          />
        </Cell>
        <Cell>{MetricsPctRender(statementsPct)}</Cell>
        <Cell>{MetricsSummaryRender('statements')}</Cell>
        <Cell>{MetricsPctRender(branchesPct)}</Cell>
        <Cell>{MetricsSummaryRender('branches')}</Cell>
        <Cell>{MetricsPctRender(functionsPct)}</Cell>
        <Cell>{MetricsSummaryRender('functions')}</Cell>
        <Cell>{MetricsPctRender(linesPct)}</Cell>
        <Cell>{MetricsSummaryRender('lines')}</Cell>
      </Row>
    )
  }
}

export const getDetailColumns = ({ maxLines, lineCoverage, annotatedCode }) => {
  const { length: maxLineLength } = String(maxLines)
  const maxCoverageLength = Math.max(...lineCoverage.filter(v => v.covered === 'yes').map(v => v.hits.length))
  return [
    {
      width: (Math.max(maxLineLength, 2) + 1) * 10,
      onCell: () => {
        return {
          style: {
            padding: '0 5px',
            textAlign: 'right',
            verticalAlign: 'top'
          }
        }
      },
      render: () => {
        return lineCoverage.map((v, i) => {
          return (
            <Link key={i} style={{ display: 'block', lineHeight: '20px' }}>
              {i + 1}
            </Link>
          )
        })
      }
    },
    {
      width: (Math.max(maxCoverageLength, 2) + 1) * 10,
      onCell: () => {
        return {
          style: {
            padding: 0,
            textAlign: 'right',
            verticalAlign: 'top',
            lineHeight: '20px'
          }
        }
      },
      render: () => {
        return lineCoverage.map((v, i) => {
          const { hits, covered } = v
          const backgroundMap = {
            neutral: '#eaeaea',
            yes: 'rgb(230, 245, 208)',
            no: '#f6c6ce'
          }
          return (
            <div
              key={i}
              dangerouslySetInnerHTML={{ __html: hits }}
              style={{
                padding: '0 5px',
                background: backgroundMap[covered]
              }}
            />
          )
        })
      }
    },
    {
      onCell: () => {
        return {
          style: {
            padding: '0 10px',
            verticalAlign: 'top',
            lineHeight: '20px'
          }
        }
      },
      render: () => {
        return (
          <pre className="prettyprint lang-js" style={{ lineHeight: '20px' }}>
            {annotatedCode.map((v, i) => {
              return <div key={i} dangerouslySetInnerHTML={{ __html: v }} />
            })}
          </pre>
        )
      }
    }
  ]
}
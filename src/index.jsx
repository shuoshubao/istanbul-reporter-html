import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, Card, Table, Typography, Progress, Space, Button, theme } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import 'antd/dist/reset.css'
import { StatsData, columns, getSummary, getDetailColumns } from './config'
import { isDark, addListenerPrefersColorScheme } from './util'
import './index.css'

const { Text, Link } = Typography
const { defaultAlgorithm, darkAlgorithm } = theme

const { datetime, Summary, Details } = StatsData

const getHash = () => {
  return window.location.hash.slice(1)
}

const Home = () => {
  const isDetail = getHash()
  return (
    <Card
      title={
        <Space>
          {isDetail && (
            <Link href="#">
              <HomeOutlined />
            </Link>
          )}
          <Text>Code coverage report</Text>
        </Space>
      }
      extra={<Button>{dayjs(datetime).format('YYYY-MM-DD HH:mm:ss')}</Button>}
    >
      <Table
        rowKey="file"
        dataSource={Summary.filter(v => (isDetail ? v.file === getHash() : true))}
        columns={columns}
        pagination={false}
        bordered
        summary={getSummary(isDetail)}
      />
    </Card>
  )
}

const Detail = () => {
  const data = Details[getHash()]
  if (!data) {
    return null
  }
  return (
    <>
      <Progress percent={100} showInfo={false} strokeLinecap="square" trailColor="#fff" />
      <Card>
        <Table columns={getDetailColumns(data)} dataSource={[{ key: 1 }]} showHeader={false} pagination={false} />
      </Card>
    </>
  )
}

const App = () => {
  if (getHash()) {
    return (
      <>
        <Home />
        <Detail />
      </>
    )
  }
  return <Home />
}

const Container = () => {
  const [dark, setDark] = useState(isDark())
  const [hash, setHash] = useState(getHash())

  useEffect(() => {
    addListenerPrefersColorScheme(value => {
      setDark(value)
    })
  }, [setDark])

  const hashchange = () => {
    setHash(getHash())
  }

  useEffect(() => {
    window.addEventListener('hashchange', hashchange)

    return () => {
      window.removeEventListener('hashchange', hashchange)
    }
  }, [])
  return (
    <ConfigProvider
      componentSize="small"
      theme={{
        algorithm: dark ? darkAlgorithm : defaultAlgorithm
      }}
    >
      <div style={{ padding: 12 }} key={hash}>
        <App />
      </div>
    </ConfigProvider>
  )
}

createRoot(document.querySelector('#app')).render(<Container />)

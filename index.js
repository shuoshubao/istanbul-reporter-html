const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')
const { ReportBase } = require('istanbul-lib-report')
const annotator = require('istanbul-reports/lib/html/annotator')
const { deflateRaw } = require('pako')

const getFileContent = fileName => {
  return readFileSync(resolve(__dirname, fileName)).toString()
}

const deflateData = data => {
  return deflateRaw(JSON.stringify(data).toString())
}

const emptyClasses = {
  statements: 'empty',
  lines: 'empty',
  functions: 'empty',
  branches: 'empty'
}

const fixPct = metrics => {
  Object.keys(emptyClasses).forEach(key => {
    metrics[key].pct = 0
  })
  return metrics
}

const StatsData = {
  datetime: null,
  Summary: [],
  Details: {}
}

module.exports = class HtmlReport extends ReportBase {
  constructor(opts) {
    super()
    this.skipEmpty = opts.skipEmpty
    this.file = opts.file || 'index.html'
  }

  onStart(root, context) {
    this.contentWriter = context.writer.writeFile(this.file)
  }

  onSummary(node, context) {
    const children = node.getChildren()
    const skipEmpty = this.skipEmpty

    children.forEach(child => {
      const metrics = child.getCoverageSummary()
      const isEmpty = metrics.isEmpty()
      if (skipEmpty && isEmpty) {
        return
      }
      let reportClasses
      if (isEmpty) {
        reportClasses = emptyClasses
      } else {
        reportClasses = {
          statements: context.classForPercent('statements', metrics.statements.pct),
          lines: context.classForPercent('lines', metrics.lines.pct),
          functions: context.classForPercent('functions', metrics.functions.pct),
          branches: context.classForPercent('branches', metrics.branches.pct)
        }
      }
      const data = {
        metrics: isEmpty ? fixPct(metrics) : metrics,
        reportClasses,
        file: child.getRelativeName()
      }
      StatsData.Summary.push(data)
    })
  }

  onDetail(node, context) {
    StatsData.Details[node.getRelativeName()] = annotator(node.getFileCoverage(), context)
  }

  onEnd() {
    StatsData.datetime = Date.now()
    const content = getFileContent('./dist/index.html').replace(
      '<script src="docs/StatsData.js">',
      `<script>window.StatsData = '${deflateData(StatsData)}'`
    )
    this.contentWriter.write(content)
  }
}

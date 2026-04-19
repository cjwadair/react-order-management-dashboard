import { createContext, useContext, type ReactNode } from 'react'

type ColumnAlign = 'left' | 'center' | 'right'

type GridColumnFieldKey<TItem> = TItem extends object ? (keyof TItem & string) : string

export type GridColumn<TItem = unknown> = {
  field?: GridColumnFieldKey<TItem>
  key?: string
  header?: ReactNode
  customHeader?: ReactNode | ((column: GridColumn<TItem>, columnIndex: number) => ReactNode)
  customCell?: ReactNode | ((item: TItem, column: GridColumn<TItem>, rowIndex: number) => ReactNode)
  span: number
  align?: ColumnAlign
  headerClassName?: string
  cellClassName?: string
}

export type GridTableProps<TItem> = {
  items: readonly TItem[]
  columns: readonly GridColumn<TItem>[]
  totalColumns: number
  getRowKey: (item: TItem, index: number) => string
  children?: ReactNode
  emptyState?: ReactNode
  containerClassName?: string
  bodyClassName?: string
  defaultHeaderCellClassName?: string
  defaultCellClassName?: string
  validateSpans?: boolean
  headerClassName?: string
  renderHeaderCell?: (column: GridColumn<TItem>, columnIndex: number) => ReactNode
  rowClassName?: string
  renderCell?: (column: GridColumn<TItem>, item: TItem, index: number) => ReactNode
}

export type GridTableHeaderProps<TItem = unknown> = {
  className?: string
  renderHeaderCell?: (column: GridColumn<TItem>, columnIndex: number) => ReactNode
}

export type GridTableRowsProps<TItem> = {
  className?: string
  renderCell?: (column: GridColumn<TItem>, item: TItem, index: number) => ReactNode
}

export type GridTableRowProps = {
  className?: string
  children: ReactNode
}

export type GridTableCellProps = {
  columnKey: string
  className?: string
  children: ReactNode
}

type SpanValidationResult = {
  valid: boolean
  spanTotal: number
}

const gridColumnsClassNames: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12',
}

const columnSpanClassNames: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
}

const alignmentClassNames: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

type GridTableContextValue<TItem> = {
  items: readonly TItem[]
  columns: readonly GridColumn<TItem>[]
  totalColumns: number
  getRowKey: (item: TItem, index: number) => string
  defaultHeaderCellClassName?: string
  defaultCellClassName?: string
}

const GridTableContext = createContext<GridTableContextValue<any> | null>(null)

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ')
}

function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (char) => char.toUpperCase())
}

function getColumnKey<TItem>(column: GridColumn<TItem>): string {
  return column.key ?? (column.field as string) ?? 'unknown'
}

function getColumnHeader<TItem>(column: GridColumn<TItem>): ReactNode {
  if (column.header !== undefined) return column.header
  const fieldName = column.field ?? column.key
  if (!fieldName) return ''
  return formatFieldName(fieldName)
}

export function getSpanTotal<TItem = unknown>(columns: readonly GridColumn<TItem>[]) {
  return columns.reduce((sum, column) => sum + column.span, 0)
}

export function validateColumnSpans<TItem = unknown>(columns: readonly GridColumn<TItem>[], totalColumns: number): SpanValidationResult {
  const spanTotal = getSpanTotal(columns)

  return {
    valid: spanTotal === totalColumns,
    spanTotal,
  }
}

function getGridColumnsClassName(totalColumns: number) {
  return gridColumnsClassNames[totalColumns]
}

function getColumnSpanClassName(span: number) {
  return columnSpanClassNames[span]
}

function getAlignmentClassName(align: ColumnAlign | undefined) {
  if (!align) {
    return undefined
  }

  return alignmentClassNames[align]
}

function useGridTableContext<TItem>() {
  const contextValue = useContext(GridTableContext)

  if (!contextValue) {
    throw new Error('GridTable compound components must be used inside GridTable.')
  }

  return contextValue as GridTableContextValue<TItem>
}

function getRequiredGridColumnsClassName(totalColumns: number) {
  const totalColumnsClassName = getGridColumnsClassName(totalColumns)

  if (!totalColumnsClassName) {
    throw new Error(`Unsupported totalColumns value: ${totalColumns}. Supported range: 1-12.`)
  }

  return totalColumnsClassName
}

function getRequiredColumnSpanClassName<TItem = unknown>(column: GridColumn<TItem>) {
  const spanClassName = getColumnSpanClassName(column.span)

  if (!spanClassName) {
    throw new Error(`Unsupported span value for column ${column.key}: ${column.span}. Supported range: 1-12.`)
  }

  return spanClassName
}

function GridTableHeader<TItem = unknown>({ className, renderHeaderCell }: GridTableHeaderProps<TItem>) {
  const { totalColumns, columns, defaultHeaderCellClassName } = useGridTableContext<TItem>()
  const totalColumnsClassName = getRequiredGridColumnsClassName(totalColumns)

  return (
    <div className={joinClassNames('grid gap-2 justify-stretch items-center w-full', totalColumnsClassName, className)}>
      {columns.map((column, columnIndex) => {
        const spanClassName = getRequiredColumnSpanClassName(column)
        const columnKey = getColumnKey(column)

        return (
          <div
            key={columnKey}
            className={joinClassNames(
              spanClassName,
              getAlignmentClassName(column.align),
              defaultHeaderCellClassName,
              column.headerClassName,
            )}
          >
            {(() => {
              const headerOverride = renderHeaderCell?.(column, columnIndex)
              if (headerOverride !== undefined) return headerOverride

              if (typeof column.customHeader === 'function') {
                return column.customHeader(column, columnIndex)
              }

              if (column.customHeader !== undefined) {
                return column.customHeader
              }

              return getColumnHeader(column)
            })()}
          </div>
        )
      })}
    </div>
  )
}

function GridTableRows<TItem>({ className, renderCell }: GridTableRowsProps<TItem>) {
  const { items, columns, totalColumns, getRowKey, defaultCellClassName } = useGridTableContext<TItem>()
  const totalColumnsClassName = getRequiredGridColumnsClassName(totalColumns)

  return items.map((item, index) => (
    <div
      key={getRowKey(item, index)}
      className={joinClassNames('grid gap-2 justify-stretch items-center w-full', totalColumnsClassName, className)}
    >
      {columns.map((column, columnIndex) => {
        const spanClassName = getRequiredColumnSpanClassName(column)
        const columnKey = getColumnKey(column)

        return (
          <div
            key={columnKey}
            className={joinClassNames(spanClassName, getAlignmentClassName(column.align), defaultCellClassName, column.cellClassName)}
          >
            {(() => {
              if (typeof column.customCell === 'function') {
                return column.customCell(item, column, index)
              }

              if (column.customCell !== undefined) {
                return column.customCell
              }

              const custom = renderCell?.(column, item, columnIndex)
              if (custom !== undefined) return custom

              const itemRecord = item as Record<string, unknown>
              if (column.field && column.field in itemRecord) {
                return String(itemRecord[column.field] ?? '')
              }

              return null
            })()}
          </div>
        )
      })}
    </div>
  ))
}

function GridTableRow({ className, children }: GridTableRowProps) {
  const { totalColumns } = useGridTableContext<unknown>()
  const totalColumnsClassName = getRequiredGridColumnsClassName(totalColumns)

  return (
    <div className={joinClassNames('grid gap-2 justify-stretch items-center w-full', totalColumnsClassName, className)}>
      {children}
    </div>
  )
}

function GridTableCell({ columnKey, className, children }: GridTableCellProps) {
  const { columns, defaultCellClassName } = useGridTableContext<unknown>()
  const column = columns.find((currentColumn) => getColumnKey(currentColumn) === columnKey)

  if (!column) {
    throw new Error(`Unknown column key: ${columnKey}.`)
  }

  const spanClassName = getRequiredColumnSpanClassName(column)

  return (
    <div className={joinClassNames(spanClassName, getAlignmentClassName(column.align), defaultCellClassName, column.cellClassName, className)}>
      {children}
    </div>
  )
}

function GridTableRoot<TItem>({
  items,
  columns,
  totalColumns,
  getRowKey,
  children,
  emptyState,
  containerClassName,
  bodyClassName,
  defaultHeaderCellClassName = 'px-4 py-3 font-medium',
  defaultCellClassName = 'px-4 py-3 text-slate-700 dark:text-slate-300',
  validateSpans = true,
  headerClassName = 'bg-accent-200 text-accent-900 dark:bg-slate-800 dark:text-slate-300 align-bottom',
  renderHeaderCell,
  rowClassName = 'border-t border-slate-200 dark:border-slate-700',
  renderCell,
}: GridTableProps<TItem>) {
  if (validateSpans) {
    const { valid, spanTotal } = validateColumnSpans(columns, totalColumns)

    if (!valid) {
      throw new Error(`Column spans must total ${totalColumns}, received ${spanTotal}.`)
    }
  }

  const resolvedEmptyState = emptyState ?? (
    <div className="border-t border-slate-200 dark:border-slate-700">
      <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
        No data available.
      </div>
    </div>
  )

  return (
    <GridTableContext.Provider value={{ items, columns, totalColumns, getRowKey, defaultHeaderCellClassName, defaultCellClassName }}
    >
      <div
        className={joinClassNames(
          'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:mx-6 lg:mx-10 xl:px-0 xl:max-w-11/12 2xl:max-w-10/12 xl:mx-auto dark:border-slate-700 dark:bg-slate-900',
          containerClassName,
        )}
      >
        <div className={joinClassNames('flex flex-col w-full text-left text-sm', bodyClassName)}>
          {children ? (
            children
          ) : (
            <>
              <GridTableHeader<TItem> className={headerClassName} renderHeaderCell={renderHeaderCell} />
              <GridTableRows className={rowClassName} renderCell={renderCell} />
            </>
          )}

          {items.length === 0 && resolvedEmptyState}
        </div>
      </div>
    </GridTableContext.Provider>
  )
}

type GridTableComponent = typeof GridTableRoot & {
  Header: typeof GridTableHeader
  Rows: typeof GridTableRows
  Row: typeof GridTableRow
  Cell: typeof GridTableCell
}

export const GridTable = Object.assign(GridTableRoot, {
  Header: GridTableHeader,
  Rows: GridTableRows,
  Row: GridTableRow,
  Cell: GridTableCell,
}) as GridTableComponent

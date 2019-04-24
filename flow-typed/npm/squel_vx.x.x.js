/* tslint:disable:max-file-line-count */

declare module 'squel' {
  declare type Flavour = 'mssql' | 'mysql' | 'postgres'

  declare type ValueHandler<T> = (
    value: T,
    asParam: boolean,
  ) => string | ParamString

  declare interface BuilderConstructor<B> {
    constructor(options?: QueryBuilderOptions): B;
  }

  /*
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   * Base interfacees
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   */

  declare interface ToParamOptions {
    /**
     * The index to start numbered parameter placeholders at. Default is `1`.
     */
    numberedParametersStartAt: number;
  }

  /**
   * Base interface for cloneable builders
   */
  declare class Cloneable {
    /**
     * Clone this object instance.
     */
    clone(): Cloneable;
  }

  declare interface CompleteQueryBuilderOptions {
    /**
     * If `true` then table names will be rendered inside quotes. The quote character used is configurable via the
     * `nameQuoteCharacter` option. `Default: (false)`.
     */
    autoQuoteTableNames: boolean;

    /**
     * If `true` then field names will be rendered inside quotes. The quote character used is configurable via the
     * `nameQuoteCharacter` option. `Default: (false)`.
     */
    autoQuoteFieldNames: boolean;

    /**
     * If `true` then alias names will be rendered inside quotes. The quote character used is configurable via the
     * `tableAliasQuoteCharacter` and `fieldAliasQuoteCharacter` options. `Default: (false)`.
     */
    autoQuoteAliasNames: boolean;

    /**
     * Use `AS` clause when outputting table aliases. `Default: (false)`.
     */
    useAsForTableAliasNames: boolean;

    /**
     * The quote character used when quoting table and field names. <code>Default: (`)</code>.
     */
    nameQuoteCharacter: string;

    /**
     * The quote character used when quoting table alias names. <code>Default: (`)</code>.
     */
    tableAliasQuoteCharacter: string;

    /**
     * The quote character used when quoting field alias names. `Default: (")`.
     */
    fieldAliasQuoteCharacter: string;

    /**
     * Custom value type handlers for this builder. These override the handlers set for the given value types via
     * [[Cls.registerValueHandler]] `Default: ([])`.
     */
    valueHandlers: ValueHandler<any>[];

    /**
     * String used to represent a parameter value. `Default: (?)`.
     */
    parameterCharacter: string;

    /**
     * Whether to use numbered parameters placeholders when building parameterized query strings.
     * `Default: (false, postgres: true)`.
     */
    numberedParameters: boolean;

    /**
     * Numbered parameters prefix character(s). `Default: ($)`.
     */
    numberedParametersPrefix: string;

    /**
     * The index to start numbered parameter placeholders at. `Default: (1)`.
     */
    numberedParametersStartAt: number;

    /**
     * Whether to replace single quotes within strings. The replacement is specified in
     * `singleQuoteReplacement`. `Default: (false)`.
     */
    replaceSingleQuotes: boolean;

    /**
     * What to replace single quotes with if replaceSingleQuotes is enabled. `Default: ('')`.
     */
    singleQuoteReplacement: string;

    /**
     * String used to join individual blocks in a query when it is stringified. `Default: ( )`.
     */
    separator: string;

    /**
     * Function to process string values, prior to insertion into a query string. `Default: (null)`.
     */
    stringFormatter: any | null;

    /**
     * Whether to prevent the addition of brackets () when nesting this query builder's output. `Default: (false)`.
     */
    rawNesting: boolean;
  }

  declare type QueryBuilderOptions = $Shape<CompleteQueryBuilderOptions>

  declare export interface ParamString {
    text: string;
    values: any[];
  }

  declare export interface FormattingOptions {
    // TODO
  }

  declare export interface BuildManyStringOptions {
    /**
     * Whether to build paramterized string. Default is false.
     */
    buildParameterized?: boolean;

    /**
     * Whether this expression is nested within another.
     */
    nested?: boolean;
  }

  declare export interface BuildStringOptions extends BuildManyStringOptions {
    /**
     * Formatting options for values in query string.
     */
    formattingOptions?: FormattingOptions;
  }

  declare export interface FormatValueResult<T = any> {
    formatted: boolean;
    value: T;
    rawNesting?: boolean;
  }

  /**
   * Base interface for all builders
   */
  declare export class BaseBuilder extends Cloneable {
    options: CompleteQueryBuilderOptions;

    constructor(options?: QueryBuilderOptions): this;

    /**
     * Register a custom value type handler. We may wish to use custom value types (e.g. `Date`) and have Squel
     * automatically take care of formatting them when building the output query string.
     *
     * @param type The interface object or `typeof` string representing the value type to handle
     * @param handler The handler method to call when we wish to format this value for output in a query string
     */
    registerValueHandler(
      type: { new(...args: any[]): any } | string,
      handler: ValueHandler<any>,
    ): this;

    /**
     * Build and return the final query string.
     */
    toString(): string;

    /**
     * Build and return the final parameterized query string along with the list of formatted parameter values.
     *
     * @param options Additional options.
     */
    toParam(options?: ToParamOptions): ParamString;

    /**
     * Sanitize given expression.
     *
     * Note: This ensures that the type is a string or BaseBuilder, else it throws an error
     */
    _sanitizeExpression<T: string | BaseBuilder>(expr: T): T;

    /**
     * Sanitize the given name.
     *
     * The 'type' parameter is used to construct a meaningful error message in case validation fails.
     */
    _sanitizeName(value: string, type: string): string;

    _sanitizeField<T: string | BaseBuilder>(item: T): T;

    _sanitizeBaseBuilder<T: BaseBuilder>(item: T): T;

    _sanitizeTable<T: string | BaseBuilder>(item: T): T;

    _sanitizeTableAlias(item: string): string;

    _sanitizeFieldAlias(item: string): string;

    /**
     * Sanitize the given limit/offset value.
     */
    _sanitizeLimitOffset(value: number): number;

    /**
     * Santize the given field value
     */
    _sanitizeValue<T>(item: T): T;

    /**
     * Escape a string value, e.g. escape quotes and other characters within it.
     */
    _escapeValue(value: string): string;

    _formatTableName(item: string): string;

    _formatFieldAlias(item: string): string;

    _formatTableAlias(item: string): string;

    _formatFieldName(
      item: string,
      formattingOptions?: { ignorePeriodsForFieldNameQuotes?: boolean },
    ): string;

    _formatCustomValue<T: any>(
      value: T,
      asParam: boolean,
      formattingOptions?: FormattingOptions,
    ): FormatValueResult<T>;

    // Note: this type definition does not handle multi-dimensional arrays
    // TODO(demurgos): Handle multidimensional arrays
    _formatValueForParamArray<T: any>(
      value: T[],
      formattingOptions?: FormattingOptions,
    ): FormatValueResult<T>[];

    _formatValueForParamArray<T: any>(
      value: T,
      formattingOptions?: FormattingOptions,
    ): FormatValueResult<T>;

    /**
     * Format the given field value for inclusion into the query string
     */
    _formatValueForQueryString(
      initialValue: any,
      formattingOptions?: FormattingOptions,
    ): string;

    _applyNestingFormatting(str: string, nesting?: boolean): string;

    /**
     * Build given string and its corresponding parameter values into
     * output.
     *
     * @param str
     * @param values
     * @param options Additional options.
     */
    _buildString(
      str: string,
      values: any[],
      options?: BuildStringOptions,
    ): ParamString;

    /**
     * Build all given strings and their corresponding parameter values into
     * output.
     *
     * @param strings
     * @param strValues array of value arrays corresponding to each string.
     * @param options Additional options.
     */
    _buildManyStrings(
      strings: string[],
      strValues: any[][],
      options?: BuildManyStringOptions,
    ): ParamString;

    _toParamString(options?: ToParamOptions): ParamString;
  }

  /*
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   * Expression
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   */

  declare export interface ExpressionNode {
    type: 'AND' | 'OR';
    expr: string | BaseBuilder;
    para: any[];
  }

  /**
   * An SQL expression builder.
   *
   * SQL expressions are used in WHERE and ON clauses to filter data by various criteria.
   *
   * Expressions can be nested. Nested expression contains can themselves
   * contain nested expressions. When rendered a nested expression will be
   * fully contained within brackets.
   *
   * All the build methods in this object return the object instance for chained method calling purposes.
   */
  declare interface Expression extends BaseBuilder {
    _nodes: ExpressionNode[];

    constructor(options?: QueryBuilderOptions): Expression;

    /**
     * Add to the current expression using `AND`.
     *
     * @param expr The expression to add
     * @param params The expression parameters supplied as additional arguments Default is `[]`.
     */
    and(expr: string | Expression, ...params: any[]): Expression;

    /**
     * Add to the current expression using `OR`.
     *
     * @param expr The expression to add
     * @param params The expression parameters supplied as additional arguments Default is `[]`.
     */
    or(expr: string | Expression, ...params: any[]): Expression;
  }

  /*
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   * Case
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   */

  declare export interface CaseItem {
    expression: string;
    values: any[];
    result?: any;
  }

  /**
   * An SQL CASE expression builder.
   *
   * SQL cases are used to select proper values based on specific criteria.
   */
  declare interface Case extends BaseBuilder {
    _cases: CaseItem[];
    _elseValue: any | null;

    /**
     * A `WHEN` clause
     *
     * @param expression The expression for the current case.
     * @param values Additional arguments for parameter substitution. See guide for examples. Default is `null`.
     */
    when(expression: string, ...values: any[]): Case;

    /**
     * A THEN clause
     *
     * @param result The result for the current case.
     */
    then(result: any): Case;

    /**
     * An `ELSE` clause
     *
     * @param elseValue The else value for the current case.
     */
    else(elseValue: any): Case;
  }

  /*
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   * Building blocks
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   */

  /**
   * A building block represents a single build-step within a query building process.
   *
   * Query builders consist of one or more building blocks which get run in a particular order. Building blocks can
   * optionally specify methods to expose through the query builder interface. They can access all the input data for
   * the query builder and manipulate it as necessary, as well as append to the final query string output.
   *
   * If you wish to customize how queries get built or add proprietary query phrases and content then it is
   * recommended that you do so using one or more custom building blocks.
   *
   * Original idea posted in https://github.com/hiddentao/export/issues/10#issuecomment-15016427
   */
  declare interface Block extends BaseBuilder {
    constructor(options?: QueryBuilderOptions): Block;
    /**
     * Get input methods to expose within the query builder.
     *
     * By default all methods except the following get returned:
     *   methods prefixed with _
     *   constructor and toString()
     *
     * @return Object key -> function pairs
     */
    exposedMethods(): { [key: string]: (...args: any[]) => any };
  }

  /**
   * A fixed string which always gets output
   */
  declare interface StringBlock extends Block {
    _str: string;

    constructor(
      options?: QueryBuilderOptions | null,
      str?: string,
    ): StringBlock;
  }

  declare interface StringBlockConstructor {
    new(options: QueryBuilderOptions | void, str: string): StringBlock;
  }

  /**
   * A function string block
   */
  declare interface FunctionBlock extends Block {
    _strings: string[];
    _values: any[];

    constructor(options?: QueryBuilderOptions): FunctionBlock;

    /**
     * Insert a function value, see [[FunctionBlock]].
     */
    function(str: string, ...value: any[]): void;
  }

  declare class FunctionMixin {
    constructor(...args: *): this;
    /**
     * Insert a function value, see [[FunctionBlock]].
     */
    function(str: string, ...value: any[]): this;
  }

  declare export interface Table {
    table: string | BaseBuilder;
    alias: string | null;
  }

  declare interface TableBlockOptions extends QueryBuilderOptions {
    /**
     * If true then only allow one table spec.
     */
    singleTable?: boolean;
  }

  declare interface AbstractTableBlock extends Block {
    options: CompleteQueryBuilderOptions & TableBlockOptions;

    _tables: Table[];

    constructor(options?: TableBlockOptions): AbstractTableBlock;

    /**
     * Update given table.
     *
     * An alias may also be specified for the table.
     *
     * Concrete subinterfacees should provide a method which calls this
     */
    _table(table: string | BaseBuilder, alias?: string): void;

    /**
     * get whether a table has been set
     */
    _hasTable(): boolean;
  }

  declare interface TargetTableBlock extends AbstractTableBlock {
    constructor(options?: TableBlockOptions): TargetTableBlock;
    target(table: string): void;
  }

  declare class TargetTableMixin {
    constructor(...args: *): this;
    /**
     * The actual target table whose data is to be deleted. Used in conjunction with `from()`.
     *
     * @param table Name of table.
     */
    target(table: string): this;
  }

  declare interface UpdateTableBlock extends AbstractTableBlock {
    constructor(options?: TableBlockOptions): UpdateTableBlock;
    table(name: string, alias?: string): void;
  }

  declare class UpdateTableMixin {
    constructor(...args: *): this;
    /**
     * A table to update.
     *
     * @param name Name of table.
     * @param alias An alias by which to refer to this table. Default is `null`.
     */
    table(name: string, alias?: string): this;
  }

  declare interface FromTableBlock extends AbstractTableBlock {
    constructor(options?: TableBlockOptions): FromTableBlock;
    from(name: string | BaseBuilder, alias?: string): void;
  }

  declare class FromTableMixin {
    constructor(...args: *): this;
    /**
     * A table to select data from.
     *
     * @param name Name of table or a builder.
     * @param alias An alias by which to refer to this table. Default is null.
     */
    from(name: string | BaseBuilder, alias?: string): this;
  }

  declare interface IntoTableBlock extends AbstractTableBlock {
    constructor(options?: TableBlockOptions): IntoTableBlock;
    into(name: string): void;
  }

  declare class IntoTableMixin {
    constructor(...args: *): this;
    /**
     * The table to insert into.
     *
     * @param name Name of table.
     */
    into(name: string): this;
  }

  declare interface FieldOptions {
    /**
     * When `autoQuoteFieldNames` is turned on this flag instructs it to ignore the period (.) character within field
     * names. Default is `false`.
     */
    ignorePeriodsForFieldNameQuotes?: boolean;
  }

  declare export interface Field {
    alias: string | null;
    field: string | BaseBuilder;
    options: FieldOptions;
  }

  declare interface GetFieldBlock extends Block {
    _fields: Field[];

    constructor(options?: QueryBuilderOptions): GetFieldBlock;

    /**
     * Add the given field to the final result set.
     *
     * The 'field' parameter does not necessarily have to be a fieldname. It can use database functions too,
     * e.g. DATE_FORMAT(a.started, "%H")
     *
     * An alias may also be specified for this field.
     */
    field(
      name: string | BaseBuilder,
      alias?: string,
      options?: FieldOptions,
    ): GetFieldBlock;

    /**
     * Add the given fields to the final result set.
     *
     * The parameter is an Object containing field names (or database functions) as the keys and aliases for the
     * fields as the values. If the value for a key is null then no alias is set for that field.
     *
     * Internally this method simply calls the field() method of this block to add each individual field.
     */
    fields(
      fields: { [field: string]: string } | string[],
      options?: FieldOptions,
    ): GetFieldBlock;
  }

  declare class GetFieldMixin {
    constructor(...args: *): this;
    /**
     * Set a field to select data for.
     *
     * @param name Name of field OR an SQL expression such as `DATE_FORMAT` OR a builder.
     * @param alias An alias by which to refer to this field. Default is `null`.
     * @param options Additional options. Default is `null`.
     */
    field(
      name: string | BaseBuilder,
      alias?: string,
      options?: FieldOptions,
    ): this;

    /**
     * Set fields to select data for.
     *
     * @param fields List of field:alias pairs OR Array of field names
     * @param options Additional options. Default is `null`.
     */
    fields(
      fields: { [field: string]: string } | string[],
      options?: FieldOptions,
    ): this;
  }

  /**
   * Additional options for `update().set()`.
   */
  declare interface SetOptions {
    /**
     * When `autoQuoteFieldNames` is turned on this flag instructs it to ignore the period (.) character within
     * field names. Default is `false`.
     */
    ignorePeriodsForFieldNameQuotes?: boolean;

    /**
     * If set and the value is a String then it will not be quoted in the output Default is `false`.
     */
    dontQuote?: boolean;
  }

  /**
   * Additional options for `update().setFields()`.
   */
  declare interface SetFieldsOptions {
    /**
     * When `autoQuoteFieldNames` is turned on this flag instructs it to ignore the period (.) character within
     * field names. Default is `false`.
     */
    ignorePeriodsForFieldNameQuotes?: boolean;
  }

  declare interface AbstractSetFieldBlock extends Block {
    _fields: (string | BaseBuilder)[];
    _values: any[][];
    _valueOptions: SetOptions[][];

    constructor(options?: QueryBuilderOptions): AbstractSetFieldBlock;

    _reset(): void;

    /**
     * Update the given field with the given value.
     * This will override any previously set value for the given field.
     */
    _set(field: string | BaseBuilder, value: any, options?: SetOptions): void;

    /**
     * Insert fields based on the key/value pairs in the given object
     */
    _setFields(fields: { [field: string]: any }, options?: SetOptions): void;
  }

  declare interface SetFieldBlock extends AbstractSetFieldBlock {
    constructor(options?: QueryBuilderOptions): SetFieldBlock;
    set(name: string, value?: any, options?: SetOptions): SetFieldBlock;

    setFields(
      fields: { [field: string]: any },
      options?: SetOptions,
    ): SetFieldBlock;

    /**
     * Insert multiple rows for the given fields. Accepts an array of objects.
     * This will override all previously set values for every field.
     */
    setFieldsRows<T: { [field: string]: any }>(
      fieldsRows: T[],
      options?: SetFieldsOptions,
    ): void;
  }

  declare class SetFieldMixin {
    constructor(...args: *): this;
    /**
     * Set a field to a value.
     *
     * @param name Name of field or an operation.
     * @param value Value to set to field. Default is `undefined`.
     * @param options Additional options. Default is `null`.
     */
    set(name: string, value?: any, options?: SetOptions): this;

    /**
     * Set fields to given values.
     *
     * @param fields Field-value pairs.
     * @param options Additional options. Default is `null`.
     */
    setFields(
      fields: { [field: string]: any },
      options?: SetFieldsOptions,
    ): this;
  }

  declare interface InsertFieldValueBlock extends AbstractSetFieldBlock {
    constructor(options?: QueryBuilderOptions): InsertFieldValueBlock;
    set(name: string, value: any, options?: SetOptions): void;

    setFields(name: { [field: string]: any }, options?: SetFieldsOptions): void;

    setFieldsRows<T: { [field: string]: any }>(
      fields: T[],
      options?: SetFieldsOptions,
    ): void;
  }

  declare class InsertFieldValueMixin {
    constructor(...args: *): this;
    /**
     * Set a field to a value.
     *
     * @param name Name of field.
     * @param value Value to set to field.
     * @param options Additional options. Default is `null`.
     */
    set(name: string, value: any, options?: SetOptions): this;

    /**
     * Set fields to given values.
     *
     * @param name Field-value pairs.
     * @param options Additional options. Default is `null`.
     */
    setFields(name: { [field: string]: any }, options?: SetFieldsOptions): this;

    /**
     * Set fields to given values in the given rows (a multi-row insert).
     *
     * @param fields An array of objects, where each object is map of field-value pairs for that row
     * @param options Additional options. Default is `null`.
     */
    setFieldsRows<T: { [field: string]: any }>(
      fields: T[],
      options?: SetFieldsOptions,
    ): this;
  }

  declare interface InsertFieldsFromQueryBlock extends Block {
    _query: null | BaseBuilder;
    constructor(options?: QueryBuilderOptions): InsertFieldsFromQueryBlock;

    fromQuery(columns: string[], selectQry: Select): void;
  }

  declare interface InsertFieldsFromQueryMixin {
    constructor(...args: *): InsertFieldsFromQueryMixin;
    /**
     * Insert results of given `SELECT` query
     *
     * @param columns Names of columns to insert.
     * @param selectQry The query to run.
     */
    fromQuery(columns: string[], selectQry: Select): InsertFieldsFromQueryMixin;
  }

  declare interface DistinctBlock extends Block {
    constructor(options?: QueryBuilderOptions): DistinctBlock;
    /**
     * Add the DISTINCT keyword to the query.
     */
    distinct(): void;
  }

  declare class DistinctMixin {
    constructor(...args: *): this;
    /**
     * Insert the DISTINCT keyword.
     */
    distinct(): this;
  }

  declare interface GroupByBlock extends Block {
    _groups: string[];

    constructor(options?: QueryBuilderOptions): GroupByBlock;

    /**
     * Add a GROUP BY transformation for the given field.
     */
    group(field: string): GroupByBlock;
  }

  declare class GroupByMixin {
    constructor(...args: *): this;
    /**
     * Add an GROUP BY clause.
     *
     * @param field Name of field to group by.
     */
    group(field: string): this;
  }

  declare interface VerbSingleValueBlockOptions extends QueryBuilderOptions {
    /**
     * The prefix verb string.
     */
    verb?: string;
  }

  declare interface AbstractVerbSingleValueBlock extends Block {
    options: CompleteQueryBuilderOptions & VerbSingleValueBlockOptions;

    _value: number;

    constructor(
      options?: VerbSingleValueBlockOptions,
    ): AbstractVerbSingleValueBlock;

    _setValue(value: number): void;
  }

  declare interface OffsetBlock extends AbstractVerbSingleValueBlock {
    constructor(options?: VerbSingleValueBlockOptions): OffsetBlock;
    /**
     * Set the OFFSET transformation.
     *
     * Call this will override the previously set offset for this query. Also note that Passing 0 for 'max' will
     * remove the offset.
     */
    offset(limit: number): void;
  }

  declare class OffsetMixin {
    constructor(...args: *): this;
    /**
     * Add an OFFSET clause.
     *
     * @param limit Index of record to start fetching from.
     */
    offset(limit: number): this;
  }

  declare interface LimitBlock extends AbstractVerbSingleValueBlock {
    constructor(options?: QueryBuilderOptions): LimitBlock;
    /**
     * Set the LIMIT transformation.
     *
     * Call this will override the previously set limit for this query. Also note that Passing 0 for 'max' will remove
     * the limit.
     */
    limit(limit: number): void;
  }

  declare class LimitMixin {
    constructor(...args: *): this;
    /**
     * Add a LIMIT clause.
     *
     * @param limit Number of records to limit the query to.
     */
    limit(limit: number): this;
  }

  declare interface ConditionBlockOptions extends QueryBuilderOptions {
    /**
     * The condition verb.
     */
    verb?: string;
  }

  declare interface Condition {
    expr: string | Expression;
    values: any[];
  }

  declare interface AbstractConditionBlock extends Block {
    options: CompleteQueryBuilderOptions & ConditionBlockOptions;

    _conditions: Condition[];

    constructor(options?: QueryBuilderOptions): AbstractConditionBlock;
  }

  declare interface WhereBlock extends AbstractConditionBlock {
    constructor(options?: ConditionBlockOptions): WhereBlock;
    where(condition: string | Expression, ...args: any[]): void;
  }

  declare class WhereMixin {
    constructor(...args: *): this;
    /**
     * Add a WHERE condition.
     *
     * @param condition The condition expression.
     * @param args Additional arguments for parameter substitution. See guide for examples. Default is `null`.
     */
    where(condition: string | Expression, ...args: any[]): this;
  }

  declare interface HavingBlock extends AbstractConditionBlock {
    constructor(options?: QueryBuilderOptions): HavingBlock;
    having(condition: string | Expression, ...args: any[]): void;
  }

  declare class HavingMixin {
    constructor(...args: *): this;
    /**
     * Add a HAVING condition.
     *
     * @param condition The condition expression.
     * @param args Additional arguments for parameter substitution. See guide for examples. Default
     *             is `null`.
     */
    having(condition: string | Expression, ...args: any[]): this;
  }

  declare interface OrderByBlock extends Block {
    constructor(options?: QueryBuilderOptions): OrderByBlock;
    /**
     * Add an ORDER BY transformation for the given field in the given order.
     *
     * To specify descending order pass false for the 'dir' parameter.
     */
    order(field: string, direction?: boolean | null, ...values: any[]): void;
  }

  declare class OrderByMixin {
    constructor(...args: *): this;
    /**
     * Add an ORDER BY clause.
     *
     * @param field Name of field to sort by.
     * @param direction Sort direction. `true` = ascending, `false` = descending, `null` = no direction set.
     *                  Default is `true`.
     * @param values List of parameter values specified as additional arguments. Default is `[]`.
     */
    order(field: string, direction?: boolean | null, ...values: any[]): this;
  }

  declare interface Join {
    type: string;
    table: string | BaseBuilder;
    alias: string | null;
    condition: string | Expression | null;
  }

  declare interface JoinBlock extends Block {
    _joins: Join[];

    constructor(options?: QueryBuilderOptions): JoinBlock;

    /**
     * Add a JOIN with the given table.
     *
     * 'table' is the name of the table to join with.
     *
     * 'alias' is an optional alias for the table name.
     *
     * 'condition' is an optional condition (containing an SQL expression) for the JOIN.
     *
     * 'type' must be either one of INNER, OUTER, LEFT or RIGHT. Default is 'INNER'.
     */
    join(
      name: string | BaseBuilder,
      alias?: string,
      condition?: string | Expression,
      type?: 'INNER' | 'OUTER' | 'LEFT' | 'RIGHT',
    ): JoinBlock;

    left_join(
      name: string | BaseBuilder,
      alias?: string,
      condition?: string | Expression,
    ): JoinBlock;

    right_join(
      name: string | BaseBuilder,
      alias?: string,
      condition?: string | Expression,
    ): JoinBlock;

    outer_join(
      name: string | BaseBuilder,
      alias?: string,
      condition?: string | Expression,
    ): JoinBlock;

    cross_join(
      name: string | BaseBuilder,
      alias?: string,
      condition?: string | Expression,
    ): JoinBlock;
  }

  declare class JoinMixin {
    constructor(...args: *): this;
    /**
     * Add an INNER JOIN.
     *
     * @param name The table to join on. Can be a a [[BaseBuilder]] instance.
     * @param alias An alias by which to refer to this table. Default is `null`.
     * @param condition A joining ON condition. Default is `null`.
     */
    join(
      name: string | BaseBuilder,
      alias?: string,
      condition?: string | Expression,
    ): this;

    /**
     * Add a LEFT JOIN.
     *
     * @param name The table to join on. Can be a a [[cls.BaseBuilder]] instance.
     * @param alias An alias by which to refer to this table. Default is `null`.
     * @param condition A joining ON condition. Default is `null`.
     */
    left_join(
      name: string | BaseBuilder,
      alias?: string,
      condition?: string | Expression,
    ): this;

    /**
     * Add a RIGHT JOIN.
     *
     * @param name The table to join on. Can be a a [[cls.BaseBuilder]] instance.
     * @param alias An alias by which to refer to this table. Default is `null`.
     * @param condition A joining ON condition. Default is `null`.
     */
    right_join(
      name: string | BaseBuilder,
      alias?: string,
      condition?: string | Expression,
    ): this;

    /**
     * Add a OUTER JOIN.
     *
     * @param name The table to join on. Can be a a [[cls.BaseBuilder]] instance.
     * @param alias An alias by which to refer to this table. Default is `null`.
     * @param condition A joining ON condition. Default is `null`.
     */
    outer_join(
      name: string | BaseBuilder,
      alias?: string,
      condition?: string | Expression,
    ): this;

    /**
     * Add a CROSS JOIN.
     *
     * @param name The table to join on. Can be a a [[cls.BaseBuilder]] instance.
     * @param alias An alias by which to refer to this table. Default is `null`.
     * @param condition A joining ON condition. Default is `null`.
     */
    cross_join(
      name: string | BaseBuilder,
      alias?: string,
      condition?: string | Expression,
    ): this;
  }

  declare interface Union {
    type: string;
    table: QueryBuilder;
  }

  declare interface UnionBlock extends Block {
    _unions: Union[];

    constructor(options?: QueryBuilderOptions): UnionBlock;

    /**
     * Add a UNION with the given table/query.
     *
     * 'table' is the name of the table or query to union with.
     *
     * 'type' must be either one of UNION or UNION ALL.... Default is 'UNION'.
     */
    union(table: QueryBuilder, type?: 'UNION' | 'UNION ALL'): void;

    /**
     * Add a UNION ALL with the given table/query.
     */
    union_all(table: QueryBuilder): void;
  }

  declare class UnionMixin {
    constructor(...args: *): this;
    /**
     * Combine with another `SELECT` using `UNION`.
     *
     * @param query Another `SELECT` query to combine this query with.
     */
    union(query: QueryBuilder): this;

    /**
     * Combine with another `SELECT` using `UNION ALL`.
     *
     * @param query Another `SELECT` query to combine this query with.
     */
    union_all(query: QueryBuilder): this;
  }

  /* tslint:disable:member-ordering */

  declare interface Cls {
    /**
     * Get whether obj is a query builder
     *
     * Note: this is a loose test checking for `_toParamString`
     */
    isSquelBuilder(obj: any): BaseBuilder;

    /**
     * Default configuration options for all query builders. These can be overridden in the query builder
     * constructors.
     */
    DefaultQueryBuilderOptions: CompleteQueryBuilderOptions;

    /**
     * Global custom value handlers for all instances of builder
     */
    globalValueHandlers: ValueHandler<any>[];

    /**
     * Register a custom value type handler. We may wish to use custom value types (e.g. `Date`) and have Squel
     * automatically take care of formatting them when building the output query string.
     *
     * @param type The interface object or `typeof` string representing the value type to handle
     * @param handler The handler method to call when we wish to format this value for output in a query string
     */
    registerValueHandler(
      type: Class<any> | string,
      handler: ValueHandler<any>,
    ): void;

    Cloneable: Class<Cloneable>;
    BaseBuilder: Class<BaseBuilder>;
    Expression: Class<Expression>;
    Case: { new(fieldName: string, options?: QueryBuilderOptions): Case };
    Block: Class<Block>;
    StringBlock: Class<StringBlock>;
    FunctionBlock: Class<FunctionBlock>;
    AbstractTableBlock: Class<AbstractTableBlock>;
    TargetTableBlock: Class<TargetTableBlock>;
    UpdateTableBlock: Class<UpdateTableBlock>;
    FromTableBlock: Class<FromTableBlock>;
    IntoTableBlock: Class<IntoTableBlock>;
    GetFieldBlock: Class<GetFieldBlock>;
    AbstractSetFieldBlock: Class<AbstractSetFieldBlock>;
    SetFieldBlock: Class<SetFieldBlock>;
    InsertFieldValueBlock: Class<InsertFieldValueBlock>;
    InsertFieldsFromQueryBlock: Class<InsertFieldsFromQueryBlock>;
    DistinctBlock: Class<DistinctBlock>;
    GroupByBlock: Class<GroupByBlock>;
    AbstractVerbSingleValueBlock: Class<AbstractVerbSingleValueBlock>;
    OffsetBlock: Class<OffsetBlock>;
    LimitBlock: Class<LimitBlock>;
    AbstractConditionBlock: Class<AbstractConditionBlock>;
    WhereBlock: Class<WhereBlock>;
    HavingBlock: Class<HavingBlock>;
    OrderByBlock: Class<OrderByBlock>;
    JoinBlock: Class<JoinBlock>;
    UnionBlock: Class<UnionBlock>;

    QueryBuilder: Class<QueryBuilder>;
    Select: Class<Select>;
    Update: Class<Update>;
    Delete: Class<Delete>;
    Insert: Class<Insert>;
  }

  /* tslint:enable:member-ordering */

  /*
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   * Query builders
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   */

  declare export class QueryBuilder extends BaseBuilder {
    blocks: Block[];

    constructor(options?: QueryBuilderOptions): this;
    constructor(options: QueryBuilderOptions | null, blocks: Block[]): this;

    /**
     * Update query builder configuration options. This will pass on the options to all the registered
     * [[Block]] objects.
     *
     * @param options Options for configuring this query builder.
     */
    updateOptions(options: QueryBuilderOptions): void;

    getBlock<B: Block>(blockType: { new(...args: any[]): B }): B;
  }

  /**
   * SELECT query builder.
   */
  declare export class Select extends QueryBuilder
    mixins FunctionMixin,
      DistinctMixin,
      GetFieldMixin,
      FromTableMixin,
      JoinMixin,
      WhereMixin,
      GroupByMixin,
      HavingMixin,
      OrderByMixin,
      LimitMixin,
      OffsetMixin,
      UnionMixin {}

  /**
   * UPDATE query builder.
   */
  declare export class Update extends QueryBuilder
    mixins UpdateTableMixin,
      SetFieldMixin,
      WhereMixin,
      OrderByMixin,
      LimitMixin {}

  /**
   * DELETE query builder.
   */
  declare export class Delete extends QueryBuilder
    mixins TargetTableMixin,
      FromTableMixin,
      JoinMixin,
      WhereMixin,
      OrderByMixin,
      LimitMixin {}

  /**
   * An INSERT query builder.
   */
  declare export interface Insert
    extends QueryBuilder,
      IntoTableMixin,
      InsertFieldValueMixin,
      InsertFieldsFromQueryMixin {}

  /* tslint:disable:member-ordering */

  declare interface Squel<
    S: Select = Select,
    U: Update = Update,
    D: Delete = Delete,
    I: Insert = Insert,
    C: Case = Case,
  > {
    /**
     * The version of Squel.
     */
    +VERSION: string;

    /**
     * The current "flavour" of this squel instance.
     */
    +flavour: Flavour | null;

    /**
     * Create a SELECT query builder instance.
     *
     * @param options Options for configuring this query builder. Default is [[DefaultQueryBuilderOptions]].
     */
    select(options?: QueryBuilderOptions): S;

    /**
     * Create a custom SELECT query builder instance.
     *
     * @param options Options for configuring this query builder. Default is [[DefaultQueryBuilderOptions]].
     * @param blocks List of [[Block]] objects which make up the functionality of this builder.
     */
    select(options: QueryBuilderOptions | null, blocks: Block[]): QueryBuilder;

    /**
     * Create an UPDATE query builder instance.
     *
     * @param options Options for configuring this query builder. Default is [[DefaultQueryBuilderOptions]].
     */
    update(options?: QueryBuilderOptions): U;

    /**
     * Create a custom UPDATE query builder instance.
     *
     * @param options Options for configuring this query builder. Default is [[DefaultQueryBuilderOptions]].
     * @param blocks List of [[Block]] objects which make up the functionality of this builder.
     */
    update(options: QueryBuilderOptions | null, blocks: Block[]): QueryBuilder;

    /**
     * Create a DELETE query builder instance.
     *
     * @param options Options for configuring this query builder. Default is [[DefaultQueryBuilderOptions]].
     */
    delete(options?: QueryBuilderOptions): D;

    /**
     * Create a custom DELETE query builder instance.
     *
     * @param options Options for configuring this query builder. Default is [[DefaultQueryBuilderOptions]].
     * @param blocks List of [[Block]] objects which make up the functionality of this builder.
     */
    delete(options: QueryBuilderOptions | null, blocks: Block[]): QueryBuilder;

    /**
     * Alias for [[delete]]
     */
    remove(options?: QueryBuilderOptions): D;

    /**
     * Alias for [[delete]]
     */
    remove(options: QueryBuilderOptions | null, blocks: Block[]): QueryBuilder;

    /**
     * Create an INSERT query builder instance.
     *
     * @param options Options for configuring this query builder. Default is [[DefaultQueryBuilderOptions]].
     */
    insert(options?: QueryBuilderOptions): I;

    /**
     * Create a custom INSERT query builder instance.
     *
     * @param options Options for configuring this query builder. Default is [[DefaultQueryBuilderOptions]].
     * @param blocks List of [[Block]] objects which make up the functionality of this builder.
     */
    insert(options: QueryBuilderOptions | null, blocks: Block[]): QueryBuilder;

    /**
     * Create an INSERT query builder instance.
     *
     * @param name Name of field. Default is `null`.
     * @param options Options for configuring this query builder. Default is [[DefaultQueryBuilderOptions]].
     */
    case(name: string, options?: QueryBuilderOptions): C;

    /**
     * Create a custom INSERT query builder instance.
     *
     * @param name Name of field. Default is `null`.
     * @param options Options for configuring this query builder. Default is [[DefaultQueryBuilderOptions]].
     * @param blocks List of [[Block]] objects which make up the functionality of this builder.
     */
    case(
      name: string,
      options: QueryBuilderOptions | null,
      blocks: Block[],
    ): QueryBuilder;

    /**
     * Create an SQL expression query builder instance.
     */
    expr(): Expression;

    /**
     * Construct a [[FunctionBlock]] instance for inclusion within a query as a value.
     *
     * @param str The expression, with parameter placeholders.
     * @param values The parameter values
     */
    str(str: string, ...values: any[]): FunctionBlock;

    /**
     * Same as [[cls.str]] but with the `rawNesting` option turned on.
     *
     * @param str The expression, with parameter placeholders.
     * @param values The parameter values
     */
    rstr(str: string, ...values: any[]): FunctionBlock;

    /**
     * Register a custom value type handler. We may wish to use custom value types (e.g. `Date`) and have Squel
     * automatically take care of formatting them when building the output query string.
     *
     * @param type The interface object or `typeof` string representing the value type to handle
     * @param handler The handler method to call when we wish to format this value for output in a query string
     */
    registerValueHandler(
      type: { new(...args: any[]): any } | string,
      handler: ValueHandler<any>,
    ): void;

    /**
     * Available flavours
     */
    +flavours: { [flavour: string]: (s: Squel<>) => void };

    /**
     * Get an instance of Squel for the MS-SQL SQL flavour.
     *
     * @param flavour The flavour of SQL to use.
     */
    useFlavour(flavour: 'mssql'): MssqlSquel;

    /**
     * Get an instance of Squel for the MySQL SQL flavour.
     *
     * @param flavour The flavour of SQL to use.
     */
    useFlavour(flavour: 'mysql'): MysqlSquel;

    /**
     * Get an instance of Squel for the Postgres SQL flavour.
     *
     * @param flavour The flavour of SQL to use.
     */
    useFlavour(flavour: 'postgres'): PostgresSquel;
  }

  /* tslint:enable:member-ordering */

  /*
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   * MS-SQL Flavour
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   */
  declare interface MssqlLimitOffsetTopBlock extends Block {
    _limits: null | number;
    _offsets: null | number;

    constructor(options?: QueryBuilderOptions): BaseBuilder;

    ParentBlock: Class<ParentBlock>;
    LimitBlock: Class<LimitBlock>;
    TopBlock: Class<TopBlock>;
    OffsetBlock: Class<OffsetBlock>;

    LIMIT(): LimitBlock;

    TOP(): TopBlock;

    OFFSET(): OffsetBlock;
  }

  // namespace MssqlLimitOffsetTopBlock {

  declare interface ParentBlock extends Block {
    _parent: Block;
  }

  declare interface TopBlock extends ParentBlock {
    top(max: number): void;
  }

  declare interface TopMixin {
    constructor(...args: *): TopMixin;
    /**
     * Insert the `TOP` keyword to limit the number of rows returned.
     *
     * @param num Number of rows or percentage of rows to limit to
     */
    top(num: number): TopMixin;
  }

  declare interface MssqlUpdateTopBlock extends Block {
    constructor(options?: QueryBuilderOptions): MssqlUpdateTopBlock;
    limit(max: number): void;

    top(max: number): void;
  }

  declare interface MssqlUpdateTopMixin {
    constructor(...args: *): MssqlUpdateTopMixin;
    /**
     * Add a LIMIT clause.
     *
     * @param limit Number of records to limit the query to.
     */
    limit(limit: number): MssqlUpdateTopMixin;

    /**
     * Insert the `TOP` keyword to limit the number of rows returned.
     *
     * @param num Number of rows or percentage of rows to limit to
     */
    top(num: number): MssqlUpdateTopMixin;
  }

  declare interface MssqlInsertFieldValueBlock extends InsertFieldValueBlock {
    _outputs: string[];

    constructor(options?: QueryBuilderOptions): MssqlInsertFieldValueBlock;

    /**
     * add fields to the output clause
     */
    output(fields: string | string[]): void;
  }

  declare class MssqlInsertFieldValueMixin extends InsertFieldValueMixin {
    constructor(...args: *): this;
    /**
     * Add field to OUTPUT clause.
     *
     * @param name Name of field or array of field names.
     */
    output(name: string | string[]): this;
  }

  declare interface Output {
    name: string;
    alias: string | null;
  }

  declare interface MssqlUpdateDeleteOutputBlock extends Block {
    _outputs: Output[];

    constructor(options?: QueryBuilderOptions): MssqlUpdateDeleteOutputBlock;

    /**
     * Add the given field to the final result set.
     *
     * The 'field' parameter does not necessarily have to be a fieldname. It can use database functions too,
     * e.g. DATE_FORMAT(a.started, "%H")
     *
     * An alias may also be specified for this field.
     */
    output(output: string, alias?: string): void;

    /**
     * Add the given fields to the final result set.
     *
     * The parameter is an Object containing field names (or database functions) as the keys and aliases for the
     * fields as the values. If the value for a key is null then no alias is set for that field.
     *
     * Internally this method simply calls the field() method of this block to add each individual field.
     */
    outputs(outputs: { [field: string]: any }): void;
  }

  declare class MssqlUpdateDeleteOutputMixin {
    constructor(...args: *): this;
    /**
     * Add field to OUTPUT clause.
     *
     * @param name Name of field.
     * @param alias An alias by which to refer to this field. Default is null.
     */
    output(name: string, alias?: string): this;

    /**
     * Add fields to `OUTPUT` clause.
     *
     * @param fields List of field:alias pairs.
     */
    outputs(fields: { [field: string]: any }): MssqlUpdateDeleteOutputMixin;
  }

  declare interface MssqlCls extends Cls {
    MssqlLimitOffsetTopBlock: Class<MssqlLimitOffsetTopBlock>;
    MssqlUpdateTopBlock: Class<MssqlUpdateTopBlock>;
    MssqlInsertFieldValueBlock: Class<MssqlInsertFieldValueBlock>;
    MssqlUpdateDeleteOutputBlock: Class<MssqlUpdateDeleteOutputBlock>;

    Select: Class<MssqlSelect>;
    Update: Class<MssqlUpdate>;
    Delete: Class<MssqlDelete>;
    Insert: Class<MssqlInsert>;
  }

  /**
   * MS-SQL SELECT query builder.
   */
  declare interface MssqlSelect extends Select {}

  /**
   * MS-SQL UPDATE query builder.
   */
  declare interface MssqlUpdate extends Update {}

  /**
   * MS-SQL DELETE query builder.
   */
  declare interface MssqlDelete extends Delete {}

  /**
   * MS-SQL INSERT query builder.
   */
  declare interface MssqlInsert extends Insert {}

  declare interface MssqlSquel
    extends Squel<MssqlSelect, MssqlUpdate, MssqlDelete, MssqlInsert> {
    cls: MssqlCls;
    flavour: 'mssql';
  }

  /*
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   * MySQL Flavour
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   */

  declare interface OnDupUpdateOptions {
    /**
     * When `autoQuoteFieldNames` is turned on this flag instructs it to ignore the period (.) character within field
     * names. Default is `false`.
     */
    ignorePeriodsForFieldNameQuotes: boolean;

    /**
     * If set and the value is a String then it will not be quoted in the output Default is `false`.
     */
    dontQuote: boolean;
  }

  declare interface MysqlOnDuplicateKeyUpdateBlock
    extends AbstractSetFieldBlock {
    constructor(options?: QueryBuilderOptions): MysqlOnDuplicateKeyUpdateBlock;
    onDupUpdate(name: string, value: any, options?: OnDupUpdateOptions): void;
  }

  declare class MysqlOnDuplicateKeyUpdateMixin {
    constructor(...args: *): this;
    /**
     * Add an ON DUPLICATE KEY UPDATE clause for given field
     *
     * @param name Name of field.
     * @param value Value to set to field.
     * @param options
     */
    onDupUpdate(name: string, value: any, options?: OnDupUpdateOptions): this;
  }

  declare interface MysqlCls extends Cls {
    MysqlOnDuplicateKeyUpdateBlock: Class<MysqlOnDuplicateKeyUpdateBlock>;
    Insert: Class<MysqlInsert>;
  }

  /**
   * MySQL INSERT query builder.
   */
  declare interface MysqlInsert extends Insert {}

  /**
   * MySQL REPLACE query builder.
   */
  declare interface Replace {}

  declare interface MysqlSquel
    extends Squel<Select, Update, Delete, MysqlInsert> {
    cls: MysqlCls;
    flavour: 'mysql';

    /**
     * Create a REPLACE query builder instance.
     *
     * @param options Options for configuring this query builder. Default is [[DefaultQueryBuilderOptions]].
     */
    replace(options?: QueryBuilderOptions): Replace;

    /**
     * Create a custom REPLACE query builder instance.
     *
     * @param options Options for configuring this query builder. Default is [[DefaultQueryBuilderOptions]].
     * @param blocks List of [[Block]] objects which make up the functionality of this builder.
     */
    replace(options: QueryBuilderOptions | null, blocks: Block[]): QueryBuilder;
  }

  /*
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   * Postgres Flavour
   * ---------------------------------------------------------------------------------------------------------
   * ---------------------------------------------------------------------------------------------------------
   */
  declare interface PostgresOnConflictKeyUpdateBlock
    extends AbstractSetFieldBlock {
    _onConflict?: boolean;
    _dupFields?: string[];

    constructor(
      options?: QueryBuilderOptions,
    ): PostgresOnConflictKeyUpdateBlock;

    onConflict(
      conflictFields: string | string[],
      fields?: { [field: string]: any },
    ): void;
  }

  declare class PostgresOnConflictKeyUpdateMixin {
    constructor(...args: *): this;
    /**
     * Add `ON CONFLICT...DO UPDATE/DO NOTHING` clause.
     *
     * @param field Name of field. Default is `null`.
     * @param fieldsToSet Field-value pairs. Default is `null`.
     */
    onConflict(field?: string, fieldsToSet?: { [field: string]: any }): this;
  }

  declare interface ReturningBlock extends Block {
    _fields: Field[];

    constructor(options?: QueryBuilderOptions): ReturningBlock;

    returning(name: string | BaseBuilder, alias?: string): void;
  }

  declare class ReturningMixin {
    constructor(...args: *): this;
    /**
     * Add field to RETURNING clause.
     *
     * @param name Name of field OR an SQL output expression.
     * @param alias An alias by which to refer to this field. Default is `null`.
     */
    returning(name: string | BaseBuilder, alias?: string): this;
  }

  declare interface WithBlock extends Block {
    _tables: QueryBuilder[];

    constructor(options?: QueryBuilderOptions): WithBlock;

    with(alias: string, table: QueryBuilder): void;
  }

  declare class WithMixin {
    constructor(...args: *): this;
    /**
     * Combine with another query using a Common Table Expression (CTE), ie a `WITH` clause
     *
     * @param alias The alias that the table expression should use
     * @param table Another query to include as a Common Table Expression
     */
    with(alias: string, table: QueryBuilder): this;
  }

  declare interface DistinctOnBlock extends Block {
    _useDistinct?: boolean;
    _distinctFields: string[];

    constructor(options?: QueryBuilderOptions): DistinctOnBlock;

    distinct(...fields: string[]): void;
  }

  declare class DistinctOnMixin {
    constructor(...args: *): this;
    /**
     * Insert the DISTINCT keyword.
     *
     * @param fields One or more field names to use. If passed, this will insert a `DISTINCT ON` clause.
     *               Default is `undefined`.
     */
    distinct(...fields: string[]): this;
  }

  declare interface PostgresCls extends Cls {
    PostgresOnConflictKeyUpdateBlock: Class<PostgresOnConflictKeyUpdateBlock>;
    ReturningBlock: Class<ReturningBlock>;
    WithBlock: Class<WithBlock>;
    DistinctOnBlock: Class<DistinctOnBlock>;

    Select: Class<PostgresSelect>;
    Update: Class<PostgresUpdate>;
    Delete: Class<PostgresDelete>;
    Insert: Class<PostgresInsert>;
  }

  declare interface PostgresSelect extends Select {
    /**
     * Insert the DISTINCT keyword.
     *
     * @param fields One or more field names to use. If passed, this will insert a `DISTINCT ON` clause.
     *               Default is `undefined`.
     */
    distinct(...fields: string[]): PostgresSelect;
  }

  /**
   * Postgres INSERT query builder
   */
  declare interface PostgresInsert extends Insert {}

  /**
   * Postgres UPDATE query builder
   */
  declare interface PostgresUpdate extends Update {}

  /**
   * Postgres DELETE query builder
   */
  declare interface PostgresDelete extends Delete {}

  declare interface PostgresSquel
    extends Squel<
      PostgresSelect,
      PostgresUpdate,
      PostgresDelete,
      PostgresInsert,
    > {
    cls: PostgresCls;
    flavour: 'postgres';
  }

  declare export default MysqlSquel
}

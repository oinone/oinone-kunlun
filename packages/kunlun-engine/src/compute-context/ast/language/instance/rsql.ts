import { CommaReader } from '../comma';
import { DotParser, DotReader } from '../dot';
import { EndReader } from '../end';
import { Language } from '../language';
import { NumberParser, NumberReader, TemplateParser, TemplateReader } from '../literal';
import {
  BinaryOperatorParser,
  BinaryOperatorReader,
  ConditionOperatorParser,
  ConditionOperatorReader,
  LogicalOperatorParser,
  LogicalOperatorReader,
  UnaryOperatorParser,
  UnaryOperatorReader
} from '../operator';
import { ArrayParser, ArrayReader, FunctionParser, FunctionReader } from '../pattern';
import {
  RSQLBinaryOperatorParser,
  RSQLBinaryOperatorReader,
  RSQLLogicalOperatorParser,
  RSQLLogicalOperatorReader,
  RSQLStringParser,
  RSQLStringReader
} from '../rsql';
import { RSQLParenParser, RSQLParenReader } from '../rsql/paren';
import { SpaceParser, SpaceReader } from '../space';
import { WordParser, WordReader } from '../word';

export const RSQLLanguageInstance = new Language({
  readers: [
    SpaceReader.INSTANCE,
    DotReader.INSTANCE,
    CommaReader.INSTANCE,
    EndReader.INSTANCE,
    WordReader.INSTANCE,

    RSQLStringReader.INSTANCE,
    TemplateReader.INSTANCE,
    NumberReader.INSTANCE,

    ArrayReader.INSTANCE,
    FunctionReader.INSTANCE,

    RSQLBinaryOperatorReader.INSTANCE,
    BinaryOperatorReader.INSTANCE,
    RSQLLogicalOperatorReader.INSTANCE,
    LogicalOperatorReader.INSTANCE,
    ConditionOperatorReader.INSTANCE,

    UnaryOperatorReader.INSTANCE,

    RSQLParenReader.INSTANCE
  ],
  parsers: [
    SpaceParser.INSTANCE,
    DotParser.INSTANCE,
    WordParser.INSTANCE,

    RSQLStringParser.INSTANCE,
    TemplateParser.INSTANCE,
    NumberParser.INSTANCE,

    ArrayParser.INSTANCE,
    FunctionParser.INSTANCE,

    RSQLBinaryOperatorParser.INSTANCE,
    BinaryOperatorParser.INSTANCE,
    UnaryOperatorParser.INSTANCE,

    RSQLLogicalOperatorParser.INSTANCE,
    LogicalOperatorParser.INSTANCE,
    ConditionOperatorParser.INSTANCE,

    RSQLParenParser.INSTANCE
  ]
});

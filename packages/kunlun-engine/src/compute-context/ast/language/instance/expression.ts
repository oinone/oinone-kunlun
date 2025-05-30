import { CommaReader } from '../comma';
import { DotParser, DotReader } from '../dot';
import { EndReader } from '../end';
import { Language } from '../language';
import { NumberParser, NumberReader, StringParser, StringReader, TemplateParser, TemplateReader } from '../literal';
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
import { ParenParser, ParenReader } from '../paren';
import { ArrayParser, ArrayReader, FunctionParser, FunctionReader } from '../pattern';
import { SpaceParser, SpaceReader } from '../space';
import { WordParser, WordReader } from '../word';

export const ExpressionLanguageInstance = new Language({
  readers: [
    SpaceReader.INSTANCE,
    DotReader.INSTANCE,
    CommaReader.INSTANCE,
    EndReader.INSTANCE,
    WordReader.INSTANCE,

    StringReader.INSTANCE,
    TemplateReader.INSTANCE,
    NumberReader.INSTANCE,

    ArrayReader.INSTANCE,
    FunctionReader.INSTANCE,

    BinaryOperatorReader.INSTANCE,
    LogicalOperatorReader.INSTANCE,
    ConditionOperatorReader.INSTANCE,

    UnaryOperatorReader.INSTANCE,

    ParenReader.INSTANCE
  ],
  parsers: [
    SpaceParser.INSTANCE,
    DotParser.INSTANCE,
    WordParser.INSTANCE,

    StringParser.INSTANCE,
    TemplateParser.INSTANCE,
    NumberParser.INSTANCE,

    ArrayParser.INSTANCE,
    FunctionParser.INSTANCE,

    BinaryOperatorParser.INSTANCE,
    UnaryOperatorParser.INSTANCE,

    LogicalOperatorParser.INSTANCE,
    ConditionOperatorParser.INSTANCE,

    ParenParser.INSTANCE
  ]
});

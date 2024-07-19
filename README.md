# eevee

A simple, configurable environment variable reader and validator with zero dependencies.

The library is intended to be very lightweight and extensible while providing type-safety.
All transformers are implemented as simple functions. The library comes with a handful
of common transformers but the intention is that you can easily add your own.

## Basic Usage

```typescript
import { ev, must, pipe, toInt } from "eevee";

const port: number = ev(process.env, "PORT", pipe(must, toInt));
```

## Using composition

```typescript
function validEmail(v: V<string | undefined>): V<string | undefined> => {
  if (v.value === undefined) {
    return v;
  }
  if (v.value.indexOf('@') < 0 || !/\.[a-z]{2,}$/.test(v.value)) {
    throw new Error("Value must be an email address.");
  }
  return v;
}

function mustBeEmail(v: V<string | undefined>) {
  return validEmail(must(v));
}

const maybeEmail: string | undefined = ev(process.env, "MAYBE_EMAIL", validEmail);
const adminEmail: string = ev(process.env, "ADMIN_EMAIL", mustBeEmail);
```

## Readers

A reader's job is simple - yield an environment variable value by name. The most common
form of a reader is to read from `process.env`. The signature of all environment variables
is a `string | undefined`. It's the job of a reader to be given a `name` and yield a
`V<string | undefined>`. Below are two examples: one using `process.env` and another for
NestJS's `ConfigService`.

```typescript
const processEnvReader = (env: Record<string, string | undefined> => (name: string) => {
  return {
    value: env[name],
    name,
    secret: false,
  };
};

const nestConfigServiceReader = (cs: ConfigService) => (name: string) => {
  return {
    value: cs.get<string>(name),
    name,
    secret: false,
  };
};
```

## Appliers

An applier's job is a bit more complicated. The purpose of an applier is to intercept
a transformation and perform some side effect (like logging) during the transformation
phase.

Below are two examples creating an applier for logging using the built-in `console` and
a third-party logger like NestJS's `Logger`. Both log errors and
post-transformation results from environment variable parsing.

```typescript
const consoleLoggerApplier: Applier = <T>(transform: VT<T>): VT<T> => {
  return (v: V<string | undefined>) => {
    let result: V<T>;
    try {
      result = transform(v);
    } catch (e) {
      console.error(`${v.name}: ${e}`);
      throw e;
    }
    if (result.secret) {
      console.log(`${v.name} = ********`);
    } else {
      console.log(`${v.name} = ${result.value}`);
    }
    return result;
  };
};

function createNestLoggerApplier(logger: Logger): Applier {
  return <T>(transform: VT<T>): VT<T> => {
    return (v: V<string | undefined>) => {
      let result: V<T>;
      try {
        result = transform(v);
      } catch (e) {
        logger.error(`${v.name}: ${e}`);
        throw e;
      }
      if (result.secret) {
        logger.log(`${v.name} = ********`);
      } else {
        logger.log(`${v.name} = ${result.value}`);
      }
      return result;
    };
  };
}
```

## `bind`

When you have a `Reader` and (optionally) an `Applier`, you can use `bind` to
create an object ready to read variables. It will automatically pull from
your configured source and pass through your applier as it is used.

```typescript
import { asDuration, bind, must, pipe } from "eevee";

const ev = bind(processEnvReader(process.env), consoleLoggerApplier(console));

const host: string = ev("SERVICE_HOST", must);
const hostTimeoutMilliseconds: number = ev(
  "SERVICE_TIMEOUT",
  pipe(must, asDuration),
);
```

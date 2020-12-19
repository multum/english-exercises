import React, { useCallback } from "react";
import {
  TextField,
  Button,
  Typography,
  Grid,
  ButtonGroup,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { Check, Refresh, Add } from "@material-ui/icons";
import { useForm, useFieldArray } from "react-hook-form";
import Dictionary, {
  Levels,
  LevelsDictionary,
} from "../../constants/irregularVerbs";

const useDictionary = () => {
  const ref = React.useRef([]);
  return React.useMemo(() => {
    const getUnusedIds = () => {
      return Dictionary.map((_, index) => index).filter(
        (id) => ref.current.indexOf(id) === -1
      );
    };
    const get = () => {
      const available = getUnusedIds();
      if (available.length) {
        const id = available[Math.floor(available.length * Math.random())];
        ref.current.push(id);
        return id;
      }
    };
    return {
      get,
      getUnusedIds,
      reset: () => {
        ref.current = [];
      },
    };
  }, []);
};

const IrregularVerbs = () => {
  const theme = useTheme();
  const { register, handleSubmit, control, getValues, reset } = useForm({
    reValidateMode: "onSubmit",
  });
  const { fields, append } = useFieldArray({
    name: "words",
    control,
    keyName: "fieldId",
  });

  const dictionary = useDictionary();
  const [level, setLevel] = React.useState(Levels.one);
  const [fieldErrors, setFieldErrors] = React.useState([]);
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const { length: amountUnusedVerbs } = dictionary.getUnusedIds();
  const resetForm = useCallback(() => {
    dictionary.reset();
    setFieldErrors([]);
    reset({
      words: [...new Array(5)].map(() => ({ id: dictionary.get() })),
    });
  }, [reset, dictionary]);

  const onSubmit = handleSubmit(() => {
    const values = getValues();
    if (values.words?.length) {
      setFieldErrors(
        values.words.map((word, index) => {
          const {
            [index]: { id },
          } = fields;
          return ["simple", "participle"].reduce((acc, t) => {
            if (word[t]) {
              acc[t] = word[t].toLowerCase().trim() !== Dictionary[id][t];
            }
            return acc;
          }, {});
        })
      );
    }
  });

  React.useEffect(() => {
    resetForm();
  }, [level, resetForm]);

  React.useEffect(() => {
    const callback = (e) => {
      if (e.keyCode === 13) {
        e.preventDefault();
        onSubmit();
      }
    };
    document.addEventListener("keypress", callback);
    return () => document.removeEventListener("keypress", callback);
  }, [onSubmit]);

  const onAppend = () => {
    append({ id: dictionary.get() }, false);
  };

  return (
    <>
      <Typography variant="h4">Irregular Verbs</Typography>
      <ButtonGroup size="large" color="primary" style={{ marginTop: 10 }}>
        {[...LevelsDictionary.entries()].map(([id, { name }]) => {
          return (
            <Button
              disabled={id === level}
              onClick={() => setLevel(id)}
              key={id}
            >
              Level {name}
            </Button>
          );
        })}
      </ButtonGroup>
      <Grid container alignItems="flex-start">
        <Grid item md={10} xs={12}>
          <Grid
            container
            direction={isSm ? "column" : "row"}
            alignItems="flex-start"
            spacing={2}
            style={{ marginTop: 15 }}
          >
            <Grid item md={6}>
              <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="center"
                spacing={2}
                style={{ marginBottom: 10 }}
              >
                <Grid
                  item
                  xs={6}
                  style={{ textAlign: "right", paddingBottom: 0 }}
                >
                  <Typography variant="body1">Past simple</Typography>
                </Grid>
                <Grid
                  item
                  xs={6}
                  style={{ textAlign: "right", paddingBottom: 0 }}
                >
                  <Typography variant="body1">Past participle</Typography>
                </Grid>
                {fields?.map((field, index) => {
                  const verb = Dictionary[field.id];
                  return verb === undefined
                    ? null
                    : ["simple", "participle"].map((type, typeIndex) => {
                        const error = fieldErrors[index]?.[type];
                        return (
                          <Grid
                            item
                            xs={6}
                            title={verb.translation}
                            key={`${field.fieldId}_${type}`}
                          >
                            <TextField
                              name={`words[${index}].${type}`}
                              label={typeIndex === 0 ? verb.infinitive : null}
                              variant="outlined"
                              error={error}
                              inputRef={register}
                              fullWidth
                              size="small"
                              disabled={error === false}
                              autoComplete="off"
                              InputProps={{
                                endAdornment:
                                  error === false ? (
                                    <InputAdornment position="end">
                                      <Check />
                                    </InputAdornment>
                                  ) : null,
                              }}
                            />
                          </Grid>
                        );
                      });
                })}
              </Grid>
            </Grid>
            <Grid
              item
              md={4}
              style={{
                background: "white",
                zIndex: 10,
                ...(isSm
                  ? { position: "fixed", bottom: 10 }
                  : { position: "sticky", top: 10 }),
              }}
            >
              <ButtonGroup size="large" variant="contained" color="secondary">
                <Button onClick={onSubmit}>
                  <Check />
                </Button>
                <Button onClick={resetForm}>
                  <Refresh />
                </Button>
                <Button onClick={onAppend} disabled={amountUnusedVerbs === 0}>
                  <Add />
                </Button>
              </ButtonGroup>
              {!isSm ? (
                <div style={{ marginTop: 10 }}>
                  <Typography variant="body1">
                    * You can press <b>'Enter'</b> to check
                  </Typography>
                  <Typography variant="body1">
                    * You can hover over the inputs and see <b>translation</b>
                  </Typography>
                </div>
              ) : null}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default IrregularVerbs;

import React, { useEffect, useState } from "react";
import {
  TextField,
  Box,
  Autocomplete,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import axios from "axios";
import CurrencyFlag from "react-currency-flags";

// Definindo a interface para as opções de moeda
interface CurrencyOption {
  code: string;
  country: string;
  label: string;
  value: string;
}

// Lista de moedas
const currencies: CurrencyOption[] = [
  { code: "BRL", country: "Brazil", label: " Brasil", value: "BRL" },
  {
    code: "USD",
    country: "United States",
    label: "🇺🇸 United States",
    value: "USD",
  },
  { code: "EUR", country: "Eurozone", label: "🇪🇺 Eurozone", value: "EUR" },
  { code: "JPY", country: "Japan", label: "🇯🇵 Japan", value: "JPY" },
  {
    code: "GBP",
    country: "United Kingdom",
    label: "🇬🇧 United Kingdom",
    value: "GBP",
  },
  // Adicione mais moedas conforme necessário
];

const Cards: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState<CurrencyOption | null>(
    currencies[0]
  ); // Padrão BRL
  const [toCurrency, setToCurrency] = useState<CurrencyOption | null>(
    currencies[1]
  ); // Padrão USD
  const [amount, setAmount] = useState<string>("1"); // Valor a ser convertido
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Gerencia mensagens de erro

  const apiKey = "9331ec5c5a74018c9ba97f82647a47bf";

  const convertCurrency = async () => {
    setError(null);
    setConvertedAmount(null);

    if (!fromCurrency || !toCurrency || !amount || isNaN(Number(amount))) {
      setError("Por favor, insira um valor numérico válido para conversão.");
      return;
    }

    setLoading(true);
    try {
      // Pegar taxas de câmbio baseadas no EUR (moeda padrão da API Fixer Free)
      const response = await axios.get(
        `http://data.fixer.io/api/latest?access_key=${apiKey}&symbols=${fromCurrency.value},${toCurrency.value}`
      );
      const rates = response.data.rates;

      if (!rates[fromCurrency.value] || !rates[toCurrency.value]) {
        throw new Error(
          "Taxa de câmbio não encontrada para as moedas selecionadas."
        );
      }

      // Calcular a conversão manualmente
      const fromRate = rates[fromCurrency.value];
      const toRate = rates[toCurrency.value];
      const converted = (Number(amount) / fromRate) * toRate;

      setConvertedAmount(converted);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        setError(
          "Erro na conexão com a API. Verifique sua rede ou a chave da API."
        );
      } else {
        setError(
          error.message || "Ocorreu um erro ao processar a solicitação."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    convertCurrency();
  }, [fromCurrency, toCurrency, amount]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      marginTop={4}
    >
      {/* Campo de valor monetário */}
      <TextField
        label="Amount"
        variant="outlined"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        sx={{ width: 300, marginBottom: 2 }}
        error={isNaN(Number(amount))}
        helperText={
          isNaN(Number(amount)) ? "Por favor, insira um valor válido" : ""
        }
      />

      {/* Seleção de moeda de origem */}
      <Autocomplete
        options={currencies}
        getOptionLabel={(option) => `${option.label} (${option.code})`}
        value={fromCurrency}
        onChange={(event, newValue) => setFromCurrency(newValue)}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.code}>
            <CurrencyFlag
              currency={option.code}
              size="sm"
              style={{ marginRight: 10 }}
            />
            {`${option.label} (${option.code})`}
          </Box>
        )}
        renderInput={(params) => (
          <TextField {...params} label="From" variant="outlined" />
        )}
        sx={{ width: 300, marginBottom: 2 }}
      />

      {/* Seleção de moeda de destino */}
      <Autocomplete
        options={currencies}
        getOptionLabel={(option) => `${option.label} (${option.code})`}
        value={toCurrency}
        onChange={(event, newValue) => setToCurrency(newValue)}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.code}>
            <CurrencyFlag
              currency={option.code}
              size="sm"
              style={{ marginRight: 10 }}
            />
            {`${option.label} (${option.code})`}
          </Box>
        )}
        renderInput={(params) => (
          <TextField {...params} label="To" variant="outlined" />
        )}
        sx={{ width: 300, marginBottom: 2 }}
      />

      {/* Exibir erro se houver */}
      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}

      {/* Botão para converter */}
      <Button
        variant="contained"
        onClick={convertCurrency}
        disabled={loading}
        sx={{ marginBottom: 2 }}
      >
        {loading ? "Converting..." : "Convert"}
      </Button>

      {/* Exibir o valor convertido */}
      {convertedAmount !== null && (
        <Typography variant="h6">
          {amount} {fromCurrency?.code} = {convertedAmount.toFixed(2)}{" "}
          {toCurrency?.code}
        </Typography>
      )}
    </Box>
  );
};

export default Cards;

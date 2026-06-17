export interface Produto {
  nome: string;
  preco: string;
  descricao: string;
  imagem: string;
}

export const produtos: Produto[] = [
  {
    nome: "Ursinho de Pelúcia",
    preco: "R$ 89,90",
    descricao: "Feito à mão com tecido antialérgico, perfeito para presentear.",
    imagem: "images/img01.jpg",
  },
  {
    nome: "Porta Maternidade",
    preco: "R$ 149,90",
    descricao: "Kit completo bordado com nome do bebê, exclusivo e artesanal.",
    imagem: "images/img05.jpg",
  },
  {
    nome: "Conjunto Roupinhas",
    preco: "R$ 120,00",
    descricao: "Tecidos suaves e naturais, costurados com amor para o seu bebê.",
    imagem: "images/img10.jpg",
  },
];

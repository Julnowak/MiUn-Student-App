import React from 'react';
import { CheckCircle, ChatDots, Calendar, Book } from "react-bootstrap-icons";

const features = [
  {
    icon: <CheckCircle className="text-primary fs-1" />,
    title: "Bezproblemowa rekrutacja",
    description: "Sprawdź progi punktowe, znajdź idealny kierunek i śledź ważne terminy. Dzięki MiUn rekrutacja staje się prostsza niż kiedykolwiek! W jednym miejscu znajdziesz wszystkie kluczowe informacje, dzięki czemu podejmiesz najlepszą decyzję."
  },
  {
    icon: <ChatDots className="text-success fs-1" />,
    title: "Forum studenckie",
    description: "Poznaj innych studentów, wymieniaj się doświadczeniami i ogłoszeniami. Dyskutuj na tematy akademickie, organizuj wspólne wyjścia i dziel się poradami dotyczącymi życia studenckiego."
  },
  {
    icon: <Calendar className="text-warning fs-1" />,
    title: "Plan zajęć i powiadomienia",
    description: "Synchronizuj swój harmonogram, otrzymuj przypomnienia o egzaminach i organizuj studenckie życie. Z MiUn nie przegapisz żadnego ważnego wydarzenia!"
  },
  {
    icon: <Book className="text-danger fs-1" />,
    title: "Baza materiałów",
    description: "Korzystaj z notatek, dziel się wiedzą i przygotowuj się do sesji z pomocą społeczności MiUn. Znajdziesz tu zbiory zadań, opracowania i przydatne wskazówki od starszych roczników."
  }
];

const Homepage = () => {
return (
    <div className="container text-center py-5" style={{ maxWidth: 1000}}>
      <h1 className="display-4 fw-bold">MiUn – Twoje studia pod kontrolą</h1>
      <p className="lead mb-5" style={{color: "white"}}>
        Aplikacja stworzona z myślą o studentach i kandydatów na studia.
        Organizuj swój plan zajęć, poznawaj ludzi i miej dostęp do najważniejszych informacji w jednym miejscu.
        Dołącz do społeczności, która ułatwia życie akademickie i daje dostęp do wszystkiego, czego potrzebujesz, by skutecznie studiować.

      </p>
    <button className="btn btn-primary btn-lg">Dołącz do MiUn</button>

      {features.map((feature, index) => (
        <div key={index} className="my-4 py-5 bg-light d-flex flex-column align-items-center">
          {feature.icon}
          <h2 className="fw-bold mt-3">{feature.title}</h2>
          <p className="text-muted w-50">{feature.description}</p>
        </div>
      ))}


    </div>
  );
}


export default Homepage;
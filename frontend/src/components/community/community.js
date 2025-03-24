import React from "react";
import { People, ChatLeftText, HandThumbsUp } from "react-bootstrap-icons";

const communityFeatures = [
  {
    icon: <People className="text-primary fs-1" />,
    title: "Poznaj społeczność",
    description: "Dołącz do tysięcy studentów, którzy dzielą się wiedzą, wspierają i pomagają sobie nawzajem."
  },
  {
    icon: <ChatLeftText className="text-success fs-1" />,
    title: "Aktywne forum",
    description: "Dyskutuj na temat studiów, wymieniaj się notatkami, organizuj wspólne wyjścia i bierz udział w życiu akademickim."
  },
  {
    icon: <HandThumbsUp className="text-warning fs-1" />,
    title: "Wspólne inicjatywy",
    description: "Bierz udział w projektach studenckich, pomagaj innym i rozwijaj się poprzez współpracę."
  }
];

export default function Community() {
  return (
    <div className="container text-center py-5">
      <h1 className="display-4 fw-bold">MiUn – Społeczność Studentów</h1>
      <p className="lead text-muted mb-5">
        MiUn to nie tylko narzędzie do organizacji studiów, ale także społeczność wspierająca rozwój akademicki.
      </p>
      {communityFeatures.map((feature, index) => (
        <div key={index} className="my-4 py-5 bg-light d-flex flex-column align-items-center">
          {feature.icon}
          <h2 className="fw-bold mt-3">{feature.title}</h2>
          <p className="text-muted w-50">{feature.description}</p>
        </div>
      ))}
      <div className="mt-5">
        <button className="btn btn-primary btn-lg">Dołącz do społeczności</button>
      </div>
    </div>
  );
}
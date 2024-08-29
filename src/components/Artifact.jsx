import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, MessageSquare, X, Send } from "lucide-react";

const DefinitionPopup = ({ term, definition, productPage, onClose }) => (
  <div className="p-4">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold text-gray-900">{term}</h3>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
    <p className="text-sm text-gray-700 mb-4">{definition}</p>
    <Button
      className="w-full justify-center"
      onClick={() => window.open(productPage, "_blank")}
    >
      Learn More
    </Button>
  </div>
);

const ExplanationPopup = ({ text, explanation, onClose }) => {
  const [currentExplanation, setCurrentExplanation] = useState(explanation);

  const handleSimplify = () => {
    setCurrentExplanation("This is a simplified version of the explanation.");
  };

  const handleMoreDetail = () => {
    setCurrentExplanation(
      "This is a more detailed version of the explanation, providing additional context and information about the topic."
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Explanation</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-gray-700 mb-4">{text}</p>
      <p className="text-sm text-gray-700 mb-4">{currentExplanation}</p>
      <div className="flex space-x-2">
        <Button onClick={handleSimplify} className="flex-1">
          Simplify
        </Button>
        <Button onClick={handleMoreDetail} className="flex-1">
          Provide more detail
        </Button>
      </div>
    </div>
  );
};

const ChatInterface = ({ initialMessage, onClose }) => {
  const [messages, setMessages] = useState([
    { text: initialMessage, sender: "user" },
    {
      text: "Hello! How can I assist you with AWS services today?",
      sender: "assistant",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "Thank you for your question. I'm an AI assistant, and I'd be happy to help you with information about AWS services. Could you please provide more details about what you'd like to know?",
            sender: "assistant",
          },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 border-b">
        <h3 className="text-lg font-semibold">Chat with AWS Assistant</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-grow overflow-y-auto p-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${
              message.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {message.text}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t p-2 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow border rounded-l-lg px-2 py-1"
        />
        <Button onClick={handleSend} className="rounded-l-none">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const Drawer = ({ isOpen, children, isChatMode }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState("auto");

  useEffect(() => {
    if (contentRef.current) {
      if (isChatMode) {
        setHeight("70vh");
      } else {
        const contentHeight = contentRef.current.scrollHeight;
        const maxHeight = window.innerHeight * 0.5;
        setHeight(Math.min(contentHeight, maxHeight));
      }
    }
  }, [children, isOpen, isChatMode]);

  return (
    <div
      className={`fixed right-0 bottom-0 w-80 bg-white rounded-t-lg shadow-lg transition-all duration-300 ease-in-out ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
      style={{
        height: height,
        maxHeight: isChatMode ? "70vh" : "50vh",
        zIndex: 40,
      }}
    >
      <div ref={contentRef} className="h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const Paragraph = ({
  children,
  qModeActive,
  isActive,
  onMouseEnter,
  onMouseLeave,
  onExplain,
  onChat,
}) => {
  return (
    <div
      className={`relative mb-4 p-2 rounded transition-colors duration-200 ${
        isActive && qModeActive ? "bg-gray-200" : ""
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      {isActive && qModeActive && (
        <div className="absolute right-0 bottom-0 translate-y-full bg-white shadow-lg rounded-b-lg px-2 py-1 flex items-center space-x-2 z-10">
          <Button size="sm" onClick={onExplain}>
            Explain
          </Button>
          <Button size="sm" onClick={onChat}>
            Chat
          </Button>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children }) => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {children}
    </section>
  );
};

const InlineCollapsibleExplanation = () => {
  const [qModeActive, setQModeActive] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);
  const [isChatMode, setIsChatMode] = useState(false);

  const openDefinitionDrawer = (term, definition, productPage) => {
    setDrawerContent(
      <DefinitionPopup
        term={term}
        definition={definition}
        productPage={productPage}
        onClose={() => setDrawerOpen(false)}
      />
    );
    setDrawerOpen(true);
    setIsChatMode(false);
  };

  const InteractiveTerm = ({ term, definition, productPage }) => (
    <span
      className={`px-1 py-0.5 rounded cursor-help transition-colors duration-200 ${
        qModeActive ? "bg-purple-200 hover:bg-purple-300" : "bg-transparent"
      }`}
      onClick={() =>
        qModeActive && openDefinitionDrawer(term, definition, productPage)
      }
    >
      {term}
    </span>
  );

  const handleExplain = (text) => {
    const loremIpsum =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
    setDrawerContent(
      <ExplanationPopup
        text={text}
        explanation={loremIpsum}
        onClose={() => setDrawerOpen(false)}
      />
    );
    setDrawerOpen(true);
    setIsChatMode(false);
  };

  const handleChat = (text) => {
    setDrawerContent(
      <ChatInterface
        initialMessage={`I'd like to know more about: "${text}"`}
        onClose={() => setDrawerOpen(false)}
      />
    );
    setDrawerOpen(true);
    setIsChatMode(true);
  };

  const createParagraphProps = (id, text) => ({
    qModeActive,
    isActive: activeParagraph === id,
    onMouseEnter: () => qModeActive && setActiveParagraph(id),
    onMouseLeave: () => setActiveParagraph(null),
    onExplain: () => handleExplain(text),
    onChat: () => handleChat(text),
  });

  return (
    <div
      className={`p-4 min-h-screen ${qModeActive ? "bg-blue-50" : "bg-white"}`}
    >
      <div className="max-w-3xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">AWS Cloud Services</h1>
          <Button
            variant={qModeActive ? "default" : "outline"}
            onClick={() => setQModeActive(!qModeActive)}
          >
            <Zap
              className={`h-4 w-4 mr-2 ${qModeActive ? "text-yellow-500" : ""}`}
            />
            Q Mode {qModeActive ? "On" : "Off"}
          </Button>
        </div>

        <Section title="Explore the Power of AWS">
          <Paragraph
            {...createParagraphProps(
              "p1",
              "AWS provides a comprehensive suite of cloud services designed to help you build, deploy, and scale applications with ease. From compute power to storage solutions, AWS has everything you need to take your ideas to the next level."
            )}
          >
            <p className="text-lg">
              AWS provides a comprehensive suite of cloud services designed to
              help you build, deploy, and scale applications with ease. From
              compute power to storage solutions, AWS has everything you need to
              take your ideas to the next level.
            </p>
          </Paragraph>
          <Paragraph
            {...createParagraphProps(
              "p2",
              "Our flagship service, EC2 (Elastic Compute Cloud), allows you to run virtual servers in the cloud, giving you the flexibility to scale your computing resources as needed. For container orchestration, we offer ECS (Elastic Container Service)."
            )}
          >
            <p>
              Our flagship service,{" "}
              <InteractiveTerm
                term="EC2 (Elastic Compute Cloud)"
                definition="EC2 provides resizable compute capacity in the cloud. It is designed to make web-scale cloud computing easier for developers."
                productPage="https://aws.amazon.com/ec2/"
              />
              , allows you to run virtual servers in the cloud, giving you the
              flexibility to scale your computing resources as needed. For
              container orchestration, we offer{" "}
              <InteractiveTerm
                term="ECS (Elastic Container Service)"
                definition="ECS is a fully managed container orchestration service that makes it easy to run, stop, and manage Docker containers on a cluster."
                productPage="https://aws.amazon.com/ecs/"
              />
              .
            </p>
          </Paragraph>
        </Section>

        <Section title="Storage and Database Solutions">
          <Paragraph
            {...createParagraphProps(
              "p3",
              "When it comes to data storage, AWS offers a range of solutions to meet your needs. Our S3 (Simple Storage Service) provides industry-leading scalability, data availability, security, and performance."
            )}
          >
            <p>
              When it comes to data storage, AWS offers a range of solutions to
              meet your needs. Our{" "}
              <InteractiveTerm
                term="S3 (Simple Storage Service)"
                definition="S3 is an object storage service offering industry-leading scalability, data availability, security, and performance."
                productPage="https://aws.amazon.com/s3/"
              />{" "}
              provides industry-leading scalability, data availability,
              security, and performance.
            </p>
          </Paragraph>
        </Section>
      </div>

      <Drawer isOpen={drawerOpen} isChatMode={isChatMode}>
        {drawerContent}
      </Drawer>

      <Button
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-lg z-30"
        onClick={() =>
          handleChat("I have a general question about AWS services.")
        }
      >
        <MessageSquare className="h-6 w-4" />
      </Button>
    </div>
  );
};

export default InlineCollapsibleExplanation;

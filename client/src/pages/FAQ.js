// src/pages/FAQ.js
import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Divider,
    Accordion,
    AccordionDetails,
    AccordionSummary
} from '@mui/joy';
import { Add as AddIcon } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const FAQ = () => {
    const { darkMode } = useTheme();
    const [expanded, setExpanded] = useState(null);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : null);
    };

    // FAQ data
    const faqItems = [
        {
            question: "How do I place an order?",
            answer: "To place an order, simply browse our products, add items to your cart, and proceed to checkout. Follow the prompts to enter your shipping information and payment details. Once your order is confirmed, you will receive an order confirmation email."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. All payments are securely processed to ensure your financial information remains protected."
        },
        {
            question: "How long will it take to receive my order?",
            answer: "Delivery times vary depending on your location. Typically, domestic orders are delivered within 3-5 business days, while international orders can take 7-14 business days. You can track your order through the tracking number provided in your shipping confirmation email."
        },
        {
            question: "What is your return policy?",
            answer: "We accept returns within 30 days of purchase. Items must be in their original condition, unworn, unwashed, and with all tags attached. To initiate a return, please contact our customer service team with your order number and reason for return."
        },
        {
            question: "How can I track my order?",
            answer: "Once your order has been shipped, you will receive a shipping confirmation email with a tracking number. You can use this number on our website or on the carrier's website to track the status of your delivery."
        },
        {
            question: "Do you ship internationally?",
            answer: "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary depending on the destination. Additional customs duties and taxes may apply for international orders and are the responsibility of the customer."
        },
        {
            question: "How do I create an account?",
            answer: "To create an account, click on the 'Sign Up' button in the top right corner of the website. You'll need to provide your email address and create a password. Having an account allows you to track orders, save your shipping information, and access exclusive deals."
        },
        {
            question: "What should I do if my order arrives damaged?",
            answer: "If your order arrives damaged, please contact our customer service team immediately at seiffyasserr@gmail.com. Include your order number and photos of the damaged items. We will arrange a replacement or refund as quickly as possible."
        },
        {
            question: "Do you offer gift wrapping?",
            answer: "Yes, we offer gift wrapping services for an additional fee. During checkout, select the gift wrapping option and you can include a personalized message for the recipient."
        },
        {
            question: "How can I contact customer support?",
            answer: "Our customer support team is available via email at seiffyasserr@gmail.com or by phone at +201090555883. Our customer service hours are Monday through Friday, 9am to 5pm EST."
        }
    ];

    return (
        <Container sx={{ py: 6 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography
                    level="h1"
                    sx={{
                        mb: 2,
                        fontWeight: 'bold',
                        color: darkMode ? 'primary.300' : 'primary.600'
                    }}
                >
                    Frequently Asked Questions
                </Typography>
                <Typography level="body-lg" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
                    Find answers to common questions about our products, ordering, shipping, returns, and more.
                </Typography>
                <Divider sx={{ maxWidth: 200, mx: 'auto', my: 4 }} />
            </Box>

            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                {faqItems.map((item, index) => (
                    <Accordion
                        key={index}
                        expanded={expanded === `panel${index}`}
                        onChange={handleChange(`panel${index}`)}
                        sx={{
                            mb: 1.5,
                            borderRadius: 'md',
                            backgroundColor: darkMode ? 'neutral.800' : 'white',
                            '&:hover': {
                                backgroundColor: darkMode ? 'neutral.700' : 'neutral.50',
                            }
                        }}
                    >
                        <AccordionSummary
                            indicator={<AddIcon />}
                            sx={{
                                '&:hover': {
                                    color: darkMode ? 'primary.300' : 'primary.600',
                                },
                                color: expanded === `panel${index}` ? (darkMode ? 'primary.300' : 'primary.600') : 'inherit',
                            }}
                        >
                            <Typography level="title-md">
                                {item.question}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                            <Typography level="body-md" sx={{ color: darkMode ? 'neutral.300' : 'neutral.700' }}>
                                {item.answer}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>

            <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    Still have questions?
                </Typography>
                <Typography level="body-lg">
                    Contact our customer service team at seiffyasserr@gmail.com or call us at +201090555883
                </Typography>
            </Box>
        </Container>
    );
};

export default FAQ;
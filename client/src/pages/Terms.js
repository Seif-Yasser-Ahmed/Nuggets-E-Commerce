// src/pages/Terms.js
import React from 'react';
import {
    Container,
    Typography,
    Box,
    Divider,
    List,
    ListItem,
    ListItemDecorator
} from '@mui/joy';
import { Circle as CircleIcon } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const Terms = () => {
    const { darkMode } = useTheme();

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
                    Terms and Conditions
                </Typography>
                <Typography level="body-lg" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
                    Last updated: May 9, 2025
                </Typography>
                <Divider sx={{ maxWidth: 200, mx: 'auto', my: 4 }} />
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    1. Introduction
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    Welcome to Nuggets ("Company", "we", "our", "us")! These Terms of Service ("Terms", "Terms of Service") govern your use of our website located at www.nuggets.com (together or individually "Service") operated by Nuggets.
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    Our Privacy Policy also governs your use of our Service and explains how we collect, safeguard and disclose information that results from your use of our web pages. Your agreement with us includes these Terms and our Privacy Policy ("Agreements"). You acknowledge that you have read and understood Agreements, and agree to be bound by them.
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    If you do not agree with (or cannot comply with) Agreements, then you may not use the Service, but please let us know by emailing at seiffyasserr@gmail.com so we can try to find a solution. These Terms apply to all visitors, users and others who wish to access or use Service.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    2. Communications
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    By using our Service, you agree to subscribe to newsletters, marketing or promotional materials and other information we may send. However, you may opt out of receiving any, or all, of these communications from us by following the unsubscribe link or by emailing at seiffyasserr@gmail.com.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    3. Purchases
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    If you wish to purchase any product or service made available through Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including but not limited to, your credit or debit card number, the expiration date of your card, your billing address, and your shipping information.
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    You represent and warrant that: (i) you have the legal right to use any card(s) or other payment method(s) in connection with any Purchase; and that (ii) the information you supply to us is true, correct and complete.
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    We reserve the right to refuse or cancel your order at any time for reasons including but not limited to: product or service availability, errors in the description or price of the product or service, error in your order or other reasons.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    4. Returns and Refunds
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    We accept returns within 30 days of purchase. Items must be in their original condition, unworn, unwashed, and with all tags attached. To initiate a return, please contact our customer service team at seiffyasserr@gmail.com with your order number and reason for return.
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    Refunds will be issued to the original form of payment used for purchase. Please allow 5-10 business days for the refund to appear in your account after we have received and processed your return.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    5. Content
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for Content that you post on or through Service, including its legality, reliability, and appropriateness.
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    By posting Content on or through Service, You represent and warrant that: (i) Content is yours (you own it) and/or you have the right to use it and the right to grant us the rights and license as provided in these Terms, and (ii) that the posting of your Content on or through Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person or entity. We reserve the right to terminate the account of anyone found to be infringing on a copyright.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    6. Prohibited Uses
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    You may use Service only for lawful purposes and in accordance with Terms. You agree not to use Service:
                </Typography>
                <List sx={{ pl: 3 }}>
                    <ListItem>
                        <ListItemDecorator>
                            <CircleIcon sx={{ fontSize: 8, color: darkMode ? 'primary.300' : 'primary.600' }} />
                        </ListItemDecorator>
                        In any way that violates any applicable national or international law or regulation.
                    </ListItem>
                    <ListItem>
                        <ListItemDecorator>
                            <CircleIcon sx={{ fontSize: 8, color: darkMode ? 'primary.300' : 'primary.600' }} />
                        </ListItemDecorator>
                        For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.
                    </ListItem>
                    <ListItem>
                        <ListItemDecorator>
                            <CircleIcon sx={{ fontSize: 8, color: darkMode ? 'primary.300' : 'primary.600' }} />
                        </ListItemDecorator>
                        To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter", "spam", or any other similar solicitation.
                    </ListItem>
                    <ListItem>
                        <ListItemDecorator>
                            <CircleIcon sx={{ fontSize: 8, color: darkMode ? 'primary.300' : 'primary.600' }} />
                        </ListItemDecorator>
                        To impersonate or attempt to impersonate Company, a Company employee, another user, or any other person or entity.
                    </ListItem>
                </List>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    7. Limitation of Liability
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    Except as prohibited by law, you will hold us and our officers, directors, employees, and agents harmless for any indirect, punitive, special, incidental, or consequential damage, however it arises (including attorneys' fees and all related costs and expenses of litigation and arbitration, or at trial or on appeal, if any, whether or not litigation or arbitration is instituted), whether in an action of contract, negligence, or other tortious action, or arising out of or in connection with this agreement, including without limitation any claim for personal injury or property damage, arising from this agreement and any violation by you of any federal, state, or local laws, statutes, rules, or regulations, even if company has been previously advised of the possibility of such damage. Except as prohibited by law, if there is liability found on the part of company, it will be limited to the amount paid for the products and/or services, and under no circumstances will there be consequential or punitive damages.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    8. Governing Law
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    These Terms shall be governed and construed in accordance with the laws of Egypt, which governing law applies to agreement without regard to its conflict of law provisions.
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    9. Changes to Terms
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    10. Contact Us
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    If you have any questions about these Terms, please contact us at seiffyasserr@gmail.com or +201090555883.
                </Typography>
            </Box>
        </Container>
    );
};

export default Terms;
import { useState } from 'react';
import {
	Mail,
	MapPin,
	Send,
	CheckCircle2,
	ArrowLeft,
	Clock,
	MessageSquare,
	User,
	AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import api from '@/api/axios';

export default function ContactUs() {
	const [formData, setFormData] = useState({
		fullName: '',
		email: '',
		subject: 'general',
		message: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage('');

		if (
			!formData.fullName.trim() ||
			!formData.email.trim() ||
			!formData.message.trim()
		) {
			setErrorMessage('Please fill in all required fields.');
			return;
		}

		setIsSubmitting(true);

		try {
			await api.post('/contact/submit', {
				full_name: formData.fullName,
				email: formData.email,
				subject: formData.subject,
				message: formData.message,
			});

			setIsSubmitted(true);
			setFormData({
				fullName: '',
				email: '',
				subject: 'general',
				message: '',
			});
		} catch (err: unknown) {
			const detail =
				err && typeof err === 'object' && 'response' in err
					? (err as { response?: { data?: { detail?: string } } }).response
							?.data?.detail
					: undefined;
			setErrorMessage(
				typeof detail === 'string' && detail
					? detail
					: 'Something went wrong while sending your message. Please try again.',
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen w-full bg-zinc-50/50 dark:bg-zinc-950/50 py-10 sm:py-14">
			<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
				{/* Back Link & Header */}
				<div className="space-y-4">
					<Link
						to="/"
						className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
					>
						<ArrowLeft className="h-3.5 w-3.5" /> Back to Overview
					</Link>

					<div>
						<div className="flex items-center gap-2.5 mb-2">
							<MessageSquare className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
							<h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
								Contact Us
							</h1>
						</div>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							Have questions regarding RAG chunking benchmarks, credit
							purchases, or technical support? Get in touch with our team.
						</p>
					</div>
				</div>

				{/* Support Info Cards Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-sm space-y-2">
						<div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
							<Mail className="h-4 w-4" /> Email Support
						</div>
						<p className="text-xs text-zinc-600 dark:text-zinc-400">
							Reach out directly for billing & support inquiries:
						</p>
						<a
							href="mailto:sumit.chauhan.code@gmail.com"
							className="block text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors pt-1"
						>
							sumit.chauhan.code@gmail.com
						</a>
					</div>

					<div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-sm space-y-2">
						<div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
							<Clock className="h-4 w-4" /> Support Hours
						</div>
						<p className="text-xs text-zinc-600 dark:text-zinc-400">
							Our team usually responds within 24 hours:
						</p>
						<p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 pt-1">
							Mon – Fri: 9:00 AM – 6:00 PM IST
						</p>
					</div>

					<div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-sm space-y-2">
						<div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
							<MapPin className="h-4 w-4" /> Registered Office
						</div>
						<p className="text-xs text-zinc-600 dark:text-zinc-400">
							RAG Matrix Tech Labs
						</p>
						<p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 pt-1 leading-tight">
							Kothri Kalan, Sehore, Madhya Pradesh, India - 466114
						</p>
					</div>
				</div>

				{/* Main Contact Form Container */}
				<div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-10 shadow-sm space-y-6">
					<div>
						<h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
							Send us a message
						</h2>
						<p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
							Fill out the form below and we’ll get back to you as soon as
							possible.
						</p>
					</div>

					{isSubmitted ? (
						<div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 p-6 text-center space-y-3 animate-in fade-in duration-200">
							<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
								<CheckCircle2 className="h-6 w-6" />
							</div>
							<h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
								Message Sent Successfully!
							</h3>
							<p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
								Thank you for contacting us. Our technical support team has
								received your message and will respond to your registered email
								address shortly.
							</p>
							<button
								onClick={() => setIsSubmitted(false)}
								className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-colors cursor-pointer"
							>
								Send Another Message
							</button>
						</div>
					) : (
						<form
							onSubmit={handleSubmit}
							className="space-y-5"
						>
							{errorMessage && (
								<div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 p-3.5 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
									<AlertCircle className="h-4 w-4 shrink-0" />
									<span>{errorMessage}</span>
								</div>
							)}

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{/* Full Name */}
								<div className="space-y-1.5">
									<label
										htmlFor="fullName"
										className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
									>
										Full Name <span className="text-rose-500">*</span>
									</label>
									<div className="relative">
										<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
											<User className="h-4 w-4" />
										</div>
										<input
											type="text"
											id="fullName"
											name="fullName"
											value={formData.fullName}
											onChange={handleChange}
											placeholder="Jane Doe"
											className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
										/>
									</div>
								</div>

								{/* Email */}
								<div className="space-y-1.5">
									<label
										htmlFor="email"
										className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
									>
										Email Address <span className="text-rose-500">*</span>
									</label>
									<div className="relative">
										<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
											<Mail className="h-4 w-4" />
										</div>
										<input
											type="email"
											id="email"
											name="email"
											value={formData.email}
											onChange={handleChange}
											placeholder="jane@example.com"
											className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
										/>
									</div>
								</div>
							</div>

							{/* Subject Dropdown */}
							<div className="space-y-1.5">
								<label
									htmlFor="subject"
									className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
								>
									Inquiry Type
								</label>
								<select
									id="subject"
									name="subject"
									value={formData.subject}
									onChange={handleChange}
									className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
								>
									<option value="general">General Inquiry</option>
									<option value="billing">Credit Top-ups & Billing</option>
									<option value="technical">
										Technical Support & Benchmarks
									</option>
									<option value="enterprise">Enterprise Custom Plans</option>
								</select>
							</div>

							{/* Message Textarea */}
							<div className="space-y-1.5">
								<label
									htmlFor="message"
									className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
								>
									Message <span className="text-rose-500">*</span>
								</label>
								<textarea
									id="message"
									name="message"
									rows={5}
									value={formData.message}
									onChange={handleChange}
									placeholder="Describe your issue or question in detail..."
									className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors resize-y"
								/>
							</div>

							{/* Submit Button */}
							<button
								type="submit"
								disabled={isSubmitting}
								className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all shadow-sm ${
									isSubmitting
										? 'bg-indigo-400 cursor-not-allowed'
										: 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer active:scale-[0.98]'
								}`}
							>
								{isSubmitting ? (
									<span>Sending Message...</span>
								) : (
									<>
										<Send className="h-4 w-4" />
										Send Message
									</>
								)}
							</button>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}

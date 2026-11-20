# Datasets & Benchmark Instructions

This directory documents the public research datasets, data structures, and preparation scripts used for training and evaluating the **AI-Powered Misinformation & Violence Detection System**.

---

## 1. Misinformation Detection Datasets

### A. ISOT Fake News Dataset (University of Victoria)
- **Source**: [ISOT Research Lab, University of Victoria](https://www.uvic.ca/engineering/ece/isot/datasets/)
- **Description**: Contains over 44,000 articles (21,417 real news articles from Reuters and 23,481 fake news articles from flagged publications).
- **Format**:
  - `True.csv` (columns: `title`, `text`, `subject`, `date`)
  - `Fake.csv` (columns: `title`, `text`, `subject`, `date`)

### B. LIAR Benchmark Dataset
- **Source**: [LIAR: A Benchmark Dataset for Fake News Detection (Wang, 2017)](https://aclanthology.org/P17-2067/)
- **Description**: 12,836 manually labeled short statements from PolitiFact across 6 fine-grained truthfulness classes (`pants-fire`, `false`, `barely-true`, `half-true`, `mostly-true`, `true`).

### C. Kaggle Real and Fake News Corpus
- **Format Expected**:
  ```csv
  id,title,text,label
  0,"NASA confirms exoplanet atmosphere discovery","Astronomers using...",0
  1,"SHOCKING: Secret lab creates mind control frequencies","Whistleblowers report...",1
  ```
- **Label Mapping**:
  - `0`: Likely Reliable / Factual
  - `1`: Potentially Misleading / Fake

### Training with Custom CSV:
To train the classifier on a custom CSV dataset:
```bash
python -m app.ml.train_misinformation --dataset path/to/dataset.csv
```

---

## 2. Violence & Threat Detection Benchmarks

### A. UCF-Crime Dataset
- **Source**: [University of Central Florida Center for Research in Computer Vision (CRCV)](https://www.crcv.ucf.edu/research/projects-loop/ucf-crime/)
- **Description**: 128 hours of surveillance video with 13 anomaly categories (fighting, assault, robbery, explosion, arson).

### B. RWF-2000 Surveillance Violence Dataset
- **Source**: [RWF-2000: An Open Large Scale Video Database for Violence Detection in Surveillance Scenes](https://github.com/mianzhi/RWF-2000)
- **Description**: 2,000 video clips captured by surveillance cameras in 30 fps with high optical motion variation.

### C. Hockey Fight Dataset & Violent-Flows (ViF)
- **Description**: High-motion frame-to-frame optical flow benchmark for crowd and interpersonal violence classification.

---

## 3. Data Preprocessing & Ethical Guidelines

1. **Text Normalization**:
   - Lowercasing, removal of URLs, email handles, and non-ASCII glyphs.
   - Stopword filtering with preservation of negation modifiers (`not`, `never`, `no`, `unproven`).
   - TF-IDF extraction using unigram + bigram features (`ngram_range=(1,2)`).

2. **Ethical Considerations & Non-Criminalization**:
   - Training datasets must not be used to profile demographic groups or individuals.
   - All classifications are probabilistic risk assessments intended for assistive human review.

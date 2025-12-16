---
sidebar: true
tagline: "Foundation"
description: "The libraries we maintain."
prev: false
next: false
editLink: false
lastUpdated: false
---

# Library Tiers

The primary purpose of the Foundation is to:

1. advance the Bitcoin software development industry by fostering innovation, promoting best practices, and improving the overall ecosystem; 
2. support the promotion, research, development, maintenance, and security of the Bitcoin Dev Kit (BDK) libraries and other projects supporting the Bitcoin software industry (the "Projects"); 
3. support and empower Bitcoin software developers through educational initiatives, open-source project support, and industry-wide collaboration; 
4. manage the technical infrastructure underlying the development of the Projects; 
5. manage and steward the BDK trademark and other assets of the Foundation;
6. undertake such other activities as may from time to time be appropriate to further the purposes and achieve the goals set forth above. 

In furtherance of these efforts, the Foundation shall seek to solicit the participation of all interested parties on a fair, equitable, and open basis.

To these ends we provide the technical infrastructure to maintain a number of software projects across different maturity levels and support models. To help you navigate these projects we've categorized them along two dimensions: **Maturity Level** (Stable vs Experimental) and **Support Model** (Foundation vs Community). 

## Library Categories

We categorize our libraries along two dimensions to help you understand what level of support and stability to expect:

|                  | **Foundation**                                | **Community**                                    |
|------------------|:---------------------------------------------:|:------------------------------------------------:|
| **Stable**       | Core BDK libraries with comprehensive support | Well-maintained libraries for specific use cases |
| **Experimental** | Foundation projects under active development  | Community-driven experimental projects           |

**Maturity Level:**  

- **_Stable_**: Production-ready libraries with stable APIs, comprehensive testing, and backward compatibility guarantees. 
- **_Experimental_**: Early-stage projects with evolving APIs, basic testing, and potential for major changes. 

**Support Model:**

- **_Foundation_**: Libraries receiving direct support and grant funding from the BDK Foundation. 
- **_Community_**: Libraries maintained primarily by volunteer contributors from the community. 

<br>

## What to expect

### _Stable + Foundation_

The core of the BDK ecosystem. Production-ready libraries that receive the highest level of attention and maintenance.

**What to expect:**

- Two official maintainers supported by grant funding from the BDK Foundation
- A robust community of users and volunteer maintainers
- Comprehensive test coverage and CI/CD
- Security updates and dependency maintenance
- Security updates back ported to prior major release
- Active monitoring and fast response to issues
- Semantic versioning with clear release notes
- Data schema stability guarantees and clear migration paths
- Extensive documentation (API, tutorials, guides, etc.) with code examples
- Example applications

### _Stable + Community_

Well-maintained, production-ready libraries serving more specific use cases. These rely more on community contributions for maintenance.

**What to expect:**

- Two official maintainers (volunteers from the community)
- Maintainers may receive grant funding from the BDK Foundation
- A robust community of users and volunteer maintainers
- Comprehensive test coverage and CI/CD
- Security updates and dependency maintenance
- Semantic versioning with clear release notes
- Response to issues within a reasonable timeframe
- Documentation (API) with code examples

### _Experimental + Foundation_

Early-stage Foundation projects undergoing active development with Foundation support.

**What to expect:**

- At least one official maintainer supported by grant funding
- Incomplete or evolving APIs
- Basic test coverage and CI/CD
- Limited backward compatibility guarantees
- Minimal documentation
- Potential for major changes as the project matures
- Clear path toward becoming Stable + Foundation

### _Experimental + Community_

Community-driven experimental projects exploring new ideas or serving niche use cases.

**What to expect:**

- At least one official maintainer (volunteer from the community)
- Incomplete or evolving APIs
- Only basic test coverage and CI/CD
- Limited or no backward compatibility guarantees
- Minimal documentation
- Potential for major changes or deprecation

## Detailed Comparison Table

|                                    | Stable +<br/>Foundation | Stable +<br/>Community | Experimental +<br/>Foundation | Experimental +<br/>Community |
|------------------------------------|:-----------------------:|:----------------------:|:-----------------------------:|:----------------------------:|
| **Maintainers**                    | 2                       | 2                      | 1+                            | 1+                           |
| **BDKF Grant Funding**             | Yes                     | Optional               | Yes                           | No                           |
| **Community Support**              | Possible                | Yes                    | Possible                      | Yes                          |
| **Comprehensive Testing & CI/CD**  | Yes                     | Yes                    | Basic                         | Basic                        |
| **Security & Dependency Updates**  | Yes                     | Yes                    | Yes                           | Limited                      |
| **Semantic Versioning**            | Yes                     | Yes                    | Yes                           | Yes                          |
| **Back-ported Security Updates**   | Yes                     | No                     | No                            | No                           |
| **Fast Response to Issues**        | Yes                     | Reasonable             | Variable                      | Variable                     |
| **API Stability**                  | Yes                     | Yes                    | No                            | No                           |
| **API Documentation & Examples**   | Extensive               | Yes                    | Minimal                       | Minimal                      |
| **Tutorials & Guides**             | Yes                     | No                     | No                            | No                           |
| **Example Applications**           | Yes                     | No                     | No                            | No                           |

## Where to Find This Information

You can find the categories assigned to each library in our [GitHub Org](https://github.com/bitcoindevkit) under the [Libraries heading](https://github.com/bitcoindevkit#our-core-libraries). There you'll also find information on the specific maintainers assigned to each library.

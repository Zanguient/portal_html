/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.5 - 08/03/2016
 *  - Mensagem da antecipação das parcelas indicando lançamentos futuros
 *
 *  Versão 1.0.41 - 04/03/2016
 *  - Correção da exibição dos valores CS
 *
 *  Versão 1.0.4 - 03/03/2016
 *  - Sem restrição para perfil da Atos
 *
 *  Versão 1.0.3 - 26/02/2016
 *  - Processamento das parcelas
 *
 *  Versão 1.0.2 - 22/02/2016
 *  - Juros e IOF
 *
 *  Versão 1.0.1 - 16/02/2016
 *  - Envio dos valores do lote em vez de vlAntecipacaoLiquida
 *
 *  Versão 1.0 - 05/02/2016
 *
 */

// App
angular.module("card-services-antecipacao-bancaria", []) 

.controller("card-services-antecipacao-bancariaCtrl", ['$scope',
                              '$state',
                              '$filter',
                              '$webapi',
                              '$apis',
                            function($scope,$state,$filter,$webapi,$apis){ 
                                
    var IOF = 0.0041; // % a.d.
    var IOFAdicional = 0.38; // %                              
    $scope.itens_pagina = [50, 100, 150, 200]; 
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Filtros
    $scope.contas = [];  
    $scope.adquirentes = [];
    $scope.bandeiras = [];  
    $scope.antecipacoes = [];                            
    $scope.filtro = {datamin : new Date(), datamax : '', data : 'Antecipação',
                     conta : null, adquirente : null, bandeira : null,
                     itens_pagina : $scope.itens_pagina[0], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };
                                          
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyAntecipacoesPos = 1; // posição da div que vai receber o loading progress                            
    // Modal Novo
    $scope.modalAntecipacao = { old : null,
                         adquirente : null,
                         antecipacoes : [],
                         bandeiras : [],
                         conta : null,
                         exibeDataAntecipacao : false,
                         dtAntecipacaoBancaria : '',
						 valorBrutoTotal: 0.0,
                         valorIOFTotal : 0.0,
                         valorIOFAdicionalTotal : 0.0,
                         valorJurosTotal : 0.0,
						 valorLiquidoTotal: 0.0,
						 //taxa : 0.0,
						 vlOperacao : '',
						 vlLiquido : '',
                         txIOF : IOF,
                         txIOFAdicional : IOFAdicional,
                         txJuros : 0.0
                       }                            
                                
    // Flags
    $scope.exibeTela = false; 
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false; 
    $scope.informaValoresCS = false;                            
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;
                                
                                
    // Inicialização do controller
    $scope.cardServices_antecipacaoBancariaInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Antecipação Bancária';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa 
        $scope.$on('alterouGrupoEmpresa', function(event){
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Reseta seleção de filtro específico de empresa
                    $scope.filtro.conta = $scope.filtro.adquirente = $scope.filtro.bandeira = null;
                    buscaContas();
                }else{ // reseta tudo e não faz buscas 
                    $scope.contas = []; 
                    $scope.adquirentes = [];
                    $scope.bandeiras = [];
                    $scope.antecipacoes = [];
                }
            }
        }); 
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){// && $scope.methodsDoControllerCorrente.length > 0){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega dados
            if($scope.usuariologado.grupoempresa) buscaContas();
        });
        // Acessou a tela
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
        buscaContas();
    }
    
    
    
    // PERMISSÕES                                           
    /**
      * Retorna true se o usuário pode cadastrar antecipações
      */
    $scope.usuarioPodeCadastrarAntecipacoes = function(){
        return permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar antecipações
      */
    $scope.usuarioPodeAlterarAntecipacoes = function(){
        return permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir antecipações
      */
    $scope.usuarioPodeExcluirAntecipacoes = function(){
        return permissaoRemocao;
    } 
    
    
    
    
    /* FILTRO */
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        
        // Limpar data => Refazer busca?
        $scope.filtro.datamin = new Date();
        $scope.filtro.datamax = ''; 
        
        $scope.filtro.adquirente = $scope.filtro.bandeira = null; 

        // Limpa relatórios
        $scope.antecipacoes = [];
    }
    
    // DATA RECEBIMENTO
    var ajustaIntervaloDeData = function(){
      // Verifica se é necessário reajustar a data max para ser no mínimo igual a data min
      if($scope.filtro.datamax && $scope.filtro.datamax < $scope.filtro.datamin) $scope.filtro.datamax = $scope.filtro.datamin;
      if(!$scope.$$phase) $scope.$apply();
    };
    // Data MIN
    $scope.exibeCalendarioDataMin = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMin = !$scope.abrirCalendarioDataMin;
        $scope.abrirCalendarioDataMax = false;
      };
    $scope.alterouDataMin = function(){
         ajustaIntervaloDeData(); 
    };
    // Data MAX
    $scope.exibeCalendarioDataMax = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMax = !$scope.abrirCalendarioDataMax;
        $scope.abrirCalendarioDataMin = false;
    };
    $scope.alterouDataMax = function(){
        if($scope.filtro.datamax === null) $scope.filtro.datamax = '';
        else ajustaIntervaloDeData(); 
    };                              
                                
                                
   var obtemFiltrosDeBusca = function(){
       var filtros = [];
       // Data
       var filtroData;
        
       if($scope.filtro.data === 'Vencimento') filtroData = {//id: $campos.card.tbantecipacaobancaria.tbantecipacaobancariadetalhe + $campos.card.tbantecipacaobancariadetalhe.dtVencimento - 100,
                          id: 202,
                          valor: $scope.getFiltroData($scope.filtro.datamin)};  
       else filtroData = {//id: $campos.card.tbantecipacaobancaria.dtAntecipacaoBancaria,
                          id: 102,
                          valor: $scope.getFiltroData($scope.filtro.datamin)};
           
       if($scope.filtro.datamax)
           filtroData.valor = filtroData.valor + '|' + $scope.getFiltroData($scope.filtro.datamax);
       filtros.push(filtroData);
        
       // Conta
       if($scope.filtro.conta && $scope.filtro.conta !== null){
           filtros.push({id: 101,//$campos.card.tbantecipacaobancaria.cdContaCorrente, 
                         valor: $scope.filtro.conta.cdContaCorrente});  
       }
        
       // Adquirente
       if($scope.filtro.adquirente && $scope.filtro.adquirente !== null){
           filtros.push({id: 103,//$campos.card.tbantecipacaobancaria.cdAdquirente, 
                         valor: $scope.filtro.adquirente.cdAdquirente});
       } 
        
       // Bandeira
       if($scope.filtro.bandeira && $scope.filtro.bandeira !== null){
           filtros.push({id: 205,///$campos.card.tbantecipacaobancaria.tbantecipacaobancariadetalhe + $campos.card.tbantecipacaobancariadetalhe.cdBadeira - 100
                         valor: $scope.filtro.bandeira.cdBandeira});
       }
        
       // Retorna    
       return filtros;
   }                             
                                
                                
                                
                                
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaAntecipacoes();
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };
                                                 
    // EXIBIÇÃO                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        buscaAntecipacoes();
    };                             
                                
                                
                                
                                
                                
    // CONTAS
    /**
      * Busca as contas correntes
      */
    var buscaContas = function(){
        
         // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            return;   
        }
        
        $scope.showProgress(divPortletBodyFiltrosPos, 10000);
        
        // Filtro  
        var filtros = [{id: /*$campos.card.tbcontacorrente.cdGrupo*/ 101,
                        valor: $scope.usuariologado.grupoempresa.id_grupo},
                       {id: /*$campos.card.tbcontacorrente.flAtivo*/ 106,
                        valor: true}];
           
        $webapi.get($apis.getUrl($apis.card.tbcontacorrente, 
                                [$scope.token, 2, 
                                 /*$campos.card.tbcontacorrente.cdBanco*/ 103, 0],
                                filtros)) 
            .then(function(dados){           

                // Obtém as contas correntes
                $scope.contas = dados.Registros;
            
                if($scope.filtro.conta && $scope.filtro.conta !== null)
                    $scope.filtro.conta = $filter('filter')($scope.contas, function(c) {return c.cdContaCorrente === $scope.filtro.conta.cdContaCorrente;})[0];
                else
                    $scope.filtro.conta = $scope.contas[0];
                
                // Busca adquirentes
                buscaAdquirentes(true);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter contas correntes (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });       
    };
    /**
      * Selecionou uma conta
      */
    $scope.alterouConta = function(progressemexecucao){
        if($scope.filtro.conta && $scope.filtro.conta !== null)
            buscaAdquirentes();
        else{
            $scope.adquirentes = [];
            $scope.bandeiras = [];
        }    
    }; 
                                
    var atualizaFlagInformaValoresCS = function(){
        console.log($scope.filtro.conta);
        $scope.informaValoresCS = $scope.filtro.conta && $scope.filtro.conta !== null && $scope.filtro.conta.banco && $scope.filtro.conta.banco !== null && $scope.filtro.conta.banco.Codigo === '047';
        console.log($scope.informaValoresCS);
    }                            
                                
                                
                                
                                
    // ADQUIRENTES 
    /**
      * Busca as adquirentes associadas à conta
      */
    var buscaAdquirentes = function(progressEstaAberto, cdAdquirente){ 
        
       if(!$scope.filtro.conta || $scope.filtro.conta === null){ 
           if(progressEstaAberto) $scope.hideProgress(divPortletBodyFiltrosPos);
           return;
       }
            
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [{id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.cdContaCorrente*/ 100, 
                       valor: $scope.filtro.conta.cdContaCorrente}];
       
       
       $webapi.get($apis.getUrl($apis.card.tbcontacorrentetbloginadquirenteempresa, 
                                [$scope.token, 4],
                                filtros))
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                // Reseta
                if(typeof cdAdquirente === 'number' && cdAdquirente > 0) 
                    $scope.filtro.adquirente = $filter('filter')($scope.adquirentes, function(a) {return a.cdAdquirente === cdAdquirente;})[0];
                else $scope.filtro.adquirente = null;
                // Busca bandeiras
                $scope.filtro.bandeira = null;
                if($scope.filtro.adquirente && $scope.filtro.adquirente !== null) 
                    buscaBandeiras(true, cdBandeira);
                else $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes da conta (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });        
    }   
    /**
      * Selecionou uma adquirente
      */
    $scope.alterouAdquirente = function(){
        buscaBandeiras();
    };
                                
    $scope.alterouAdquirenteModalAntecipacao = function(refreshBandeiras){
        buscaBandeiras(false, undefined, true, refreshBandeiras);
    }                            
                                
                                
                                
                                
                                
    // BANDEIRAS  
    /**
      * Busca as bandeiras
      */                                             
    var buscaBandeiras = function(progressEstaAberto, cdBandeira, modalAntecipacao, refreshBandeirasModal){
       
        if(modalAntecipacao){
           if(!$scope.modalAntecipacao.adquirente || $scope.modalAntecipacao.adquirente === null){
               $scope.modalAntecipacao.bandeiras = [];
               if(progressEstaAberto) $scope.hideProgress();
               return;      
           }
        }else if(!$scope.filtro.adquirente || $scope.filtro.adquirente === null){
           $scope.filtro.bandeira = null;
           $scope.bandeiras = [];
           if(progressEstaAberto) $scope.hideProgress(divPortletBodyFiltrosPos);
           return;
       }    
        
       if(!progressEstaAberto){ 
           if(modalAntecipacao)
               $scope.showProgress();
           else 
               $scope.showProgress(divPortletBodyFiltrosPos, 10000);
       }
        
       var filtros = {id: /*$campos.card.tbbandeira.cdAdquirente */ 102, 
                      valor: modalAntecipacao ? $scope.modalAntecipacao.adquirente.cdAdquirente : $scope.filtro.adquirente.cdAdquirente};
       
       $webapi.get($apis.getUrl($apis.card.tbbandeira, 
                                [$scope.token, 1, /*$campos.card.tbbandeira.dsBandeira*/ 101],
                                filtros)) 
            .then(function(dados){
                if(modalAntecipacao){ 
                    $scope.modalAntecipacao.bandeiras = dados.Registros;
                    if(refreshBandeirasModal) refreshBandeirasModalAntecipacao();
                    $scope.hideProgress();
                }else{ 
                    $scope.bandeiras = dados.Registros;
                    // Reseta ou seta para um objeto
                    if(typeof cdBandeira === 'number' && cdBandeira > 0){ 
                        $scope.filtro.bandeira = $filter('filter')($scope.bandeiras, function(b) {return b.cdBandeira === cdBandeira;})[0];
                        if(!$scope.filtro.bandeira) $scope.filtro.bandeira = null;
                    }else $scope.filtro.bandeira = null;
                    // Esconde o progress
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                }
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter bandeiras (' + failData.status + ')', true, 'danger', true);
                  
                 if(modalAntecipacao) $scope.hideProgress();
                 else $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou uma bandeira
      */
    $scope.alterouBandeira = function(){
        //console.log($scope.filtro.bandeira);    
    };  
                                
                                
                                
                                
                                
                                
    // ANTECIPAÇÕES
    $scope.buscaAntecipacoes = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        // Intervalo de data
        if($scope.filtro.datamax){
            var timeDiff = Math.abs($scope.filtro.datamax.getTime() - $scope.filtro.datamin.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
            if(diffDays > 31){
                var periodo = diffDays <= 366 ? diffDays + ' dias' : 'mais de um ano';
                $scope.showModalAlerta('Por favor, selecione um intervalo de data de no máximo 31 dias. (Sua seleção consta ' + periodo + ')', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.exibeCalendarioDataMax();}, 300);
                                    }
                                  );
                return; 
            }
        }
        
        if(!$scope.filtro.conta || $scope.filtro.conta === null){
            $scope.showModalAlerta('Uma conta deve ser selecionada!');
            return;
        }
        
        // Busca as antecipações
        buscaAntecipacoes();
    }    
    
    
    var buscaAntecipacoes = function(emprogresso){
        
       if(!$scope.filtro.conta || $scope.filtro.conta === null){
           if(emprogresso){
               $scope.hideProgress(divPortletBodyAntecipacoesPos);
               $scope.hideProgress(divPortletBodyFiltrosPos);
           }
           return;
       }
        
       if(!emprogresso){    
           $scope.showProgress(divPortletBodyFiltrosPos, 10000);  
           $scope.showProgress(divPortletBodyAntecipacoesPos);
       }
        
       var filtros = obtemFiltrosDeBusca();
        
       var order = 102;//$campos.card.tbantecipacaobancaria.dtAntecipacaoBancaria; 
       
       $webapi.get($apis.getUrl($apis.card.tbantecipacaobancaria, 
                                [$scope.token, 2, order, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){
                $scope.antecipacoes = dados.Registros;
           
                atualizaFlagInformaValoresCS();
           
                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.antecipacoes.length === 0) $scope.filtro.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }

                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Esconde o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyAntecipacoesPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter antecipações bancárias (' + failData.status + ')', true, 'danger', true); 
                 // Esconde o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyAntecipacoesPos);
              });   
    }
    
    
    // TABELA EXPANSÍVEL
    $scope.toggle = function(item){
        if(!item || item === null) return;
        if(item.collapsed) item.collapsed = false;
        else item.collapsed = true;
    }
    $scope.isExpanded = function(item){
        if(!item || item === null) return false;
        return item.collapsed;
    }
    
    
    
    // MODAL ANTECIPAÇÃO
    $scope.exibeCalendarioData = function($event, obj, flagName) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        //console.log(obj);
        //console.log(obj['exibeDataAntecipacao']);
        obj[flagName] = !obj[flagName];
    }
    
    var fechaModalAntecipacao = function(){
        $('#modalAntecipacao').modal('hide');    
    }
    var exibeModalAntecipacao = function(){
        $('#modalAntecipacao').modal('show');    
    }
    
    $scope.novaAntecipacao = function(){
        $scope.modalAntecipacao.conta = $scope.filtro.conta;
        $scope.modalAntecipacao.old = null;
        $scope.modalAntecipacao.exibeDataAntecipacao = false;
        if($scope.filtro.adquirente && $scope.filtro.adquirente !== null){
			$scope.modalAntecipacao.adquirente = $scope.filtro.adquirente;
			angular.copy($scope.bandeiras, $scope.modalAntecipacao.bandeiras);
		}
		else{
			$scope.modalAntecipacao.adquirente = $scope.adquirentes[0];
			$scope.alterouAdquirenteModalAntecipacao(); // busca bandeiras
		}
		$scope.modalAntecipacao.valorBrutoTotal = 0.0;
		$scope.modalAntecipacao.valorLiquidoTotal = 0.0;
        $scope.modalAntecipacao.antecipacoes = [];
        $scope.modalAntecipacao.dtAntecipacaoBancaria = '';
        $scope.modalAntecipacao.vlOperacao = '';
        $scope.modalAntecipacao.vlLiquido = '';
        $scope.modalAntecipacao.txIOF = IOF;
        $scope.modalAntecipacao.txIOFAdicional = IOFAdicional;
        $scope.modalAntecipacao.txJuros = 0.0;
		
		// Adiciona uma linha vazia
		$scope.novaAntecipacaoModalAntecipacao();
        
        
        exibeModalAntecipacao();
    }
	
	$scope.calculaValorTotal = function(){
        //console.log("valor total");
		$scope.modalAntecipacao.valorBrutoTotal = 0.0;
        $scope.modalAntecipacao.valorIOFTotal = 0.0;
        $scope.modalAntecipacao.valorIOFAdicionalTotal = 0.0;
        $scope.modalAntecipacao.valorJurosTotal = 0.0;
		$scope.modalAntecipacao.valorLiquidoTotal = 0.0;
		for(var k = 0; k < $scope.modalAntecipacao.antecipacoes.length; k++){
			var antecipacao = $scope.modalAntecipacao.antecipacoes[k];
            //console.log(antecipacao);
			var vlAntecipacao = 0.0;
            var vlJuros = 0.0;
            var vlIOF = 0.0;
            var vlIOFAdicional = 0.0;
            var vlAntecipacaoLiquida = 0.0;
			if(antecipacao.vlAntecipacao){
                if(typeof antecipacao.vlAntecipacao === 'string'){
                    try{ 
                         vlAntecipacao = parseFloat(antecipacao.vlAntecipacao.split('.').join('').split(',').join('.'));
                    }catch(ex){ }
                }
                else vlAntecipacao = antecipacao.vlAntecipacao;
			}
            if(antecipacao.vlJuros){
                if(typeof antecipacao.vlJuros === 'string'){
                    try{ 
                         vlJuros = parseFloat(antecipacao.vlJuros.split('.').join('').split(',').join('.'));
                    }catch(ex){ }
                }
                else vlJuros = antecipacao.vlJuros;
			}
            if(antecipacao.vlIOF){
                if(typeof antecipacao.vlIOF === 'string'){
                    try{ 
                         vlIOF = parseFloat(antecipacao.vlIOF.split('.').join('').split(',').join('.'));
                    }catch(ex){ }
                }
                else vlIOF = antecipacao.vlIOF;
			}
            if(antecipacao.vlIOFAdicional){
                if(typeof antecipacao.vlIOFAdicional === 'string'){
                    try{ 
                         vlIOFAdicional = parseFloat(antecipacao.vlIOFAdicional.split('.').join('').split(',').join('.'));
                    }catch(ex){ }
                }
                else vlIOFAdicional = antecipacao.vlIOFAdicional;
			}
            if(antecipacao.vlAntecipacaoLiquida){
                if(typeof antecipacao.vlAntecipacaoLiquida === 'string'){
                    try{ 
                         vlAntecipacaoLiquida = parseFloat(antecipacao.vlAntecipacaoLiquida.split('.').join('').split(',').join('.'));
                    }catch(ex){ }
                }
                else vlAntecipacaoLiquida = antecipacao.vlAntecipacaoLiquida;
			}
            //console.log("Juros: " + vlJuros);
            //console.log("IOF: " + vlIOF);
            //console.log("IOF Adicional: " + vlIOFAdicional);
            //antecipacao.vlAntecipacaoLiquida = valorB - vlIOFAdicional - vlIOF - vlJuros;
			//antecipacao.vlAntecipacaoLiquida = valorB * (1 - $scope.modalAntecipacao.taxa);
			$scope.modalAntecipacao.valorBrutoTotal += vlAntecipacao;
            $scope.modalAntecipacao.valorJurosTotal += parseFloat(vlJuros.toFixed(2));
            $scope.modalAntecipacao.valorIOFTotal += parseFloat(vlIOF.toFixed(2));
            $scope.modalAntecipacao.valorIOFAdicionalTotal += parseFloat(vlIOFAdicional.toFixed(2));
            $scope.modalAntecipacao.valorLiquidoTotal += parseFloat(vlAntecipacaoLiquida.toFixed(2));
		}
		//$scope.modalAntecipacao.valorLiquidoTotal = $scope.modalAntecipacao.valorBrutoTotal * (1 - $scope.modalAntecipacao.taxa);
	}
	
	$scope.valoresModalAntecipacaoIgualInformado = function(){
		var valorBruto = 0.0;
		if($scope.modalAntecipacao.vlOperacao){
            if(typeof $scope.modalAntecipacao.vlOperacao === 'string'){
                try{ 
                    valorBruto = parseFloat($scope.modalAntecipacao.vlOperacao.split('.').join('').split(',').join('.'));
                }catch(ex){ }
            }
            else valorBruto = $scope.modalAntecipacao.vlOperacao;
		}
        var valorLiquido = 0.0;
		if($scope.modalAntecipacao.vlLiquido){
            if(typeof $scope.modalAntecipacao.vlLiquido === 'string'){
                try{ 
                    valorLiquido = parseFloat($scope.modalAntecipacao.vlLiquido.split('.').join('').split(',').join('.'));
                }catch(ex){ }
            }
            else valorLiquido = $scope.modalAntecipacao.vlLiquido;
		}
        var vLTotal = parseFloat($scope.modalAntecipacao.valorLiquidoTotal.toFixed(2));
        //console.log(valorBruto);
        //console.log($scope.modalAntecipacao.valorBrutoTotal);
        //console.log(valorLiquido);
        //console.log($scope.modalAntecipacao.valorLiquidoTotal);
		return valorBruto > 0.0 && Math.abs($scope.modalAntecipacao.valorBrutoTotal - valorBruto) <= 0.001 &&
               valorLiquido > 0.0 && Math.abs(vLTotal - valorLiquido) <= 0.001; 
	}
    
    $scope.calculaValoresTaxas =  function(antecipacao){
        
        //console.log("valores das taxas");
        
        if(!$scope.modalAntecipacao.dtAntecipacaoBancaria || $scope.modalAntecipacao.dtAntecipacaoBancaria === null)
            return;
        
        var dtAntecipacaoBancaria = $scope.modalAntecipacao.dtAntecipacaoBancaria;
        if(typeof dtAntecipacaoBancaria.getFullYear !== 'function')
            dtAntecipacaoBancaria = $scope.getDataFromDate(dtAntecipacaoBancaria);
        
        var antecipacoes = [];
        if(!antecipacao || antecipacao == null){
            // Faz para todos!
            antecipacoes = $scope.modalAntecipacao.antecipacoes;
        }
        else
            antecipacoes.push(antecipacao);
        
        // Taxa de Juros
        var txJuros = 0.0;
        if(typeof $scope.modalAntecipacao.txJuros === 'string'){
            try{ 
                txJuros = parseFloat($scope.modalAntecipacao.txJuros.split('.').join('').split(',').join('.'));
            }catch(ex){ }
        }else txJuros = $scope.modalAntecipacao.txJuros;
        // Taxa IOF
        var txIOF = 0.0;
        if(typeof $scope.modalAntecipacao.txIOF === 'string'){
            try{ 
                txIOF = parseFloat($scope.modalAntecipacao.txIOF.split('.').join('').split(',').join('.'));
            }catch(ex){ }
        }else txIOF = $scope.modalAntecipacao.txIOF;
        // Taxa IOF Adicional
        var txIOFAdicional = 0.0;
        if(typeof $scope.modalAntecipacao.txIOFAdicional === 'string'){
            try{ 
                txIOFAdicional = parseFloat($scope.modalAntecipacao.txIOFAdicional.split('.').join('').split(',').join('.'));
            }catch(ex){ }
        }else txIOFAdicional = $scope.modalAntecipacao.txIOFAdicional;
        
        for(var k = 0; k < antecipacoes.length; k++){
			var a = antecipacoes[k];
            
            if(!a.dtVencimento || a.dtVencimento === null)
                continue;
            
            var competencia = a.dtVencimento;
            if(typeof competencia.getFullYear !== 'function')
                competencia = $scope.getDataFromDate(competencia);
            
            var vlAntecipacao = 0.0;
            if(a.vlAntecipacao){
                if(typeof a.vlAntecipacao === 'string'){
                    try{ 
                         vlAntecipacao = parseFloat(a.vlAntecipacao.split('.').join('').split(',').join('.'));
                    }catch(ex){ }
                }
                else vlAntecipacao = a.vlAntecipacao;
            }
            
            
            var diffDays = $scope.dateDiffInDays(dtAntecipacaoBancaria, competencia);
            
            var vlJuros = vlAntecipacao * diffDays * txJuros / (30 * 100);
            var valComJuros = vlAntecipacao - vlJuros;
            var percentualIOF = txIOFAdicional + diffDays * txIOF;
            var valorIOF = Math.trunc(valComJuros * percentualIOF) / 100.0;
            var vlIOF = parseFloat(((valorIOF * (diffDays * txIOF)) / percentualIOF).toFixed(2));
            var vlIOFAdicional = parseFloat(((valorIOF * txIOFAdicional) / percentualIOF).toFixed(2));
            
            //console.log("Juros: " + vlJuros);
            //console.log("IOF: " + vlIOF);
            //console.log("IOF Adicional: " + vlIOFAdicional);
            a.vlJuros = vlJuros;
            a.vlIOF = vlIOF;
            a.vlIOFAdicional = vlIOFAdicional;
            a.vlAntecipacaoLiquida = vlAntecipacao - vlJuros - vlIOF - vlIOFAdicional;
        }
        
        $scope.calculaValorTotal();
    }
	
	$scope.calculaValorLiquido = function(antecipacao){
		
        if(!antecipacao || antecipacao === null) return;
        
        var vlAntecipacao = 0.0;
        var vlJuros = 0.0;
        var vlIOF = 0.0;
        var vlIOFAdicional = 0.0;
        if(antecipacao.vlAntecipacao){
            if(typeof antecipacao.vlAntecipacao === 'string'){
                try{ 
                     vlAntecipacao = parseFloat(antecipacao.vlAntecipacao.split('.').join('').split(',').join('.'));
                }catch(ex){ }
            }
            else vlAntecipacao = antecipacao.vlAntecipacao;
        }
        if(antecipacao.vlJuros){
            if(typeof antecipacao.vlJuros === 'string'){
                try{ 
                     vlJuros = parseFloat(antecipacao.vlJuros.split('.').join('').split(',').join('.'));
                }catch(ex){ }
            }
            else vlJuros = antecipacao.vlJuros;
        }
        if(antecipacao.vlIOF){
            if(typeof antecipacao.vlIOF === 'string'){
                try{ 
                     vlIOF = parseFloat(antecipacao.vlIOF.split('.').join('').split(',').join('.'));
                }catch(ex){ }
            }
            else vlIOF = antecipacao.vlIOF;
        }
        if(antecipacao.vlIOFAdicional){
            if(typeof antecipacao.vlIOFAdicional === 'string'){
                try{ 
                     vlIOFAdicional = parseFloat(antecipacao.vlIOFAdicional.split('.').join('').split(',').join('.'));
                }catch(ex){ }
            }
            else vlIOFAdicional = antecipacao.vlIOFAdicional;
        }
        antecipacao.vlAntecipacaoLiquida = vlAntecipacao - vlIOFAdicional - vlIOF - vlJuros;
		
		$scope.calculaValorTotal();
		//console.log('Bruto: ' + valorBruto);
		//console.log('Líquido: ' + valorLiquido);
		//console.log('Taxa: ' + $scope.modalAntecipacao.taxa);
	}
    
    $scope.novaAntecipacaoModalAntecipacao = function(){
        if(!$scope.modalAntecipacao.antecipacoes || $scope.modalAntecipacao.antecipacoes === null)
            $scope.modalAntecipacao.antecipacoes = [];
        
        var bandeira = null;
        var dtVencimento = '';
        if($scope.modalAntecipacao.antecipacoes.length > 0){
            var lastAntecipacao = $scope.modalAntecipacao.antecipacoes[$scope.modalAntecipacao.antecipacoes.length - 1];
            // Pega a mesma bandeira do anterior
            if(lastAntecipacao.bandeira && lastAntecipacao.bandeira !== null)
                bandeira = lastAntecipacao.bandeira;
            // Data de vencimento
            if(lastAntecipacao.dtVencimento && lastAntecipacao.dtVencimento !== null)
            {
                dtVencimento = new Date(lastAntecipacao.dtVencimento.getFullYear(), lastAntecipacao.dtVencimento.getMonth(), lastAntecipacao.dtVencimento.getDate());
                // Próximo dia útil
                do{ 
                    dtVencimento.setDate(dtVencimento.getDate() + 1);
                }while(dtVencimento.getDay() === 6 || dtVencimento.getDay() === 0);
            }
        }
        
        $scope.modalAntecipacao.antecipacoes.push({ idAntecipacaoBancariaDetalhe : -1,
                                             dtVencimento : dtVencimento,
                                             bandeira : bandeira,
                                             vlAntecipacao : '',
                                             vlJuros : 0.0,
                                             vlIOF : 0.0,
                                             vlIOFAdicional : 0.0,
                                             vlAntecipacaoLiquida : '',
                                             exibeDataVencimento : '',
                                           });
    }
    
    
    $scope.removeAntecipacaoModalAntecipacao = function(index){
        if(index > -1 && index < $scope.modalAntecipacao.antecipacoes.length)
            $scope.modalAntecipacao.antecipacoes.splice(index, 1);
    }
    
	
	var validaCamposModalAntecipacao = function(){
		// Conta
		if(!$scope.modalAntecipacao.conta || $scope.modalAntecipacao.conta == null){
			$scope.showModalAlerta('Uma conta deve ser selecionada!');
			return false;
		}
		// Adquirente
		if(!$scope.modalAntecipacao.adquirente || $scope.modalAntecipacao.adquirente == null){
			$scope.showModalAlerta('Uma adquirente deve ser selecionada!');
			return false;
		}
		// Data de antecipação bancária
		if(!$scope.modalAntecipacao.dtAntecipacaoBancaria || $scope.modalAntecipacao.dtAntecipacaoBancaria == null){
			$scope.showModalAlerta('Uma data de antecipação bancária deve ser informada!');
			return false;
		}
		/*if(!$scope.validaData($scope.modalAntecipacao.dtAntecipacaoBancaria)){
			$scope.showModalAlerta('Data de antecipação bancária informada é inválida!');
			return false;
		}*/
        // Valor bruto total
        var valorOperacao = 0.0;
        if(typeof $scope.modalAntecipacao.vlOperacao === 'string'){
            try{ 
                valorOperacao = parseFloat($scope.modalAntecipacao.vlOperacao.split('.').join('').split(',').join('.'));
            }catch(ex){
                $scope.showModalAlerta('Valor da operação informado é inválido!');
                return false;
            }
        }else valorOperacao = $scope.modalAntecipacao.vlOperacao;
        // Valor líquido da operação
        var valorOperacaoLiquido = 0.0;
        //console.log($scope.modalAntecipacao.vlLiquido);
        //console.log(typeof $scope.modalAntecipacao.vlLiquido);
        if(typeof $scope.modalAntecipacao.vlLiquido === 'string'){
            try{ 
                valorOperacaoLiquido = parseFloat($scope.modalAntecipacao.vlLiquido.split('.').join('').split(',').join('.'));
            }catch(ex){
                $scope.showModalAlerta('Valor líquido da operação informado é inválido!');
                return false;
            }
        }else valorOperacaoLiquido = $scope.modalAntecipacao.vlLiquido;
        // Taxa de Juros
        var txJuros = 0.0;
        if(typeof $scope.modalAntecipacao.txJuros === 'string'){
            try{ 
                txJuros = parseFloat($scope.modalAntecipacao.txJuros.split('.').join('').split(',').join('.'));
            }catch(ex){
                $scope.showModalAlerta('Taxa aplicada informada é inválida!');
                return false;
            }
        }else txJuros = $scope.modalAntecipacao.txJuros;
        // Taxa IOF
        var txIOF = 0.0;
        if(typeof $scope.modalAntecipacao.txIOF === 'string'){
            try{ 
                txIOF = parseFloat($scope.modalAntecipacao.txIOF.split('.').join('').split(',').join('.'));
            }catch(ex){
                $scope.showModalAlerta('Taxa IOF (% a.d.) informada é inválida!');
                return false;
            }
        }else txIOF = $scope.modalAntecipacao.txIOF;
        // Taxa IOF Adicional
        var txIOFAdicional = 0.0;
        if(typeof $scope.modalAntecipacao.txIOFAdicional === 'string'){
            try{ 
                txIOFAdicional = parseFloat($scope.modalAntecipacao.txIOFAdicional.split('.').join('').split(',').join('.'));
            }catch(ex){
                $scope.showModalAlerta('Taxa IOF adicional (%) informada é inválida!');
                return false;
            }
        }else txIOFAdicional = $scope.modalAntecipacao.txIOFAdicional;
		// Antecipações
		if(!$scope.modalAntecipacao.antecipacoes ||  $scope.modalAntecipacao.antecipacoes === null || $scope.modalAntecipacao.antecipacoes.length === 0){
			$scope.showModalAlerta('Deve ser informada ao menos uma informação detalhada de antecipação!');
			return false;
		}
        
        var valorB = 0.0;
        var valorL = 0.0;
		for(var k = 0; k < $scope.modalAntecipacao.antecipacoes.length; k++){
			var antecipacao = $scope.modalAntecipacao.antecipacoes[k];
			/*if(!antecipacao.bandeira || antecipacao.bandeira === null){
				$scope.showModalAlerta('Deve ser informada a bandeira da antecipação ' + (k + 1) + '!');
				return false;
			}*/
			// Data do vencimento
			if(!antecipacao.dtVencimento || antecipacao.dtVencimento == null){
				$scope.showModalAlerta('Uma data de vencimento deve ser informada! (registro ' + (k + 1) + ')');
				return false;
			}
			/*if(!$scope.validaData(antecipacao.dtVencimento)){
				$scope.showModalAlerta('Data de vencimento informada do registro ' + (k + 1) + ' é inválida!');
				return false;
			}*/
			var valorBruto = 0.0;
			if(antecipacao.vlAntecipacao){
                if(typeof antecipacao.vlAntecipacao === 'string'){
                    try{ 
                        //console.log(antecipacao.vlAntecipacao);
                        //console.log(antecipacao.vlAntecipacao.split('.').join('').split(',').join('.'));
                        valorBruto = parseFloat(antecipacao.vlAntecipacao.split('.').join('').split(',').join('.'));
                    }catch(ex){
                        $scope.showModalAlerta('Valor bruto informado é inválido! (registro ' + (k + 1) + ')');
                        return false;
                    }
                }
                else valorBruto = antecipacao.vlAntecipacao;
			}
			//console.log(valorBruto);
			if(valorBruto === 0.0){
				$scope.showModalAlerta('Informe o valor bruto do registro ' + (k + 1));
				return false;
			}
            
            var vlJuros = 0.0;
			if(antecipacao.vlJuros){
                if(typeof antecipacao.vlJuros === 'string'){
                    try{ 
                        //console.log(antecipacao.vlAntecipacao);
                        //console.log(antecipacao.vlAntecipacao.split('.').join('').split(',').join('.'));
                        vlJuros = parseFloat(antecipacao.vlJuros.split('.').join('').split(',').join('.'));
                    }catch(ex){
                        $scope.showModalAlerta('Valor cobrado de juros informado é inválido! (registro ' + (k + 1) + ')');
                        return false;
                    }
                }
                else vlJuros = antecipacao.vlJuros;
			}
            
            var vlIOF = 0.0;
			if(antecipacao.vlIOF){
                if(typeof antecipacao.vlIOF === 'string'){
                    try{ 
                        //console.log(antecipacao.vlAntecipacao);
                        //console.log(antecipacao.vlAntecipacao.split('.').join('').split(',').join('.'));
                        vlJuros = parseFloat(antecipacao.vlIOF.split('.').join('').split(',').join('.'));
                    }catch(ex){
                        $scope.showModalAlerta('Valor cobrado de IOF a.d. informado é inválido! (registro ' + (k + 1) + ')');
                        return false;
                    }
                }
                else vlIOF = antecipacao.vlIOF;
			}
            
            var vlIOFAdicional = 0.0;
			if(antecipacao.vlIOFAdicional){
                if(typeof antecipacao.vlIOFAdicional === 'string'){
                    try{ 
                        //console.log(antecipacao.vlAntecipacao);
                        //console.log(antecipacao.vlAntecipacao.split('.').join('').split(',').join('.'));
                        vlIOFAdicional = parseFloat(antecipacao.vlIOFAdicional.split('.').join('').split(',').join('.'));
                    }catch(ex){
                        $scope.showModalAlerta('Valor cobrado de IOF adicional informado é inválido! (registro ' + (k + 1) + ')');
                        return false;
                    }
                }
                else vlIOFAdicional = antecipacao.vlIOFAdicional;
			}
            
			var valorLiquido = 0.0;
			if(antecipacao.vlAntecipacaoLiquida){
                if(typeof antecipacao.vlAntecipacaoLiquida === 'string'){
                    try{ 
                        //console.log(antecipacao.vlAntecipacaoLiquida);
                        //console.log(antecipacao.vlAntecipacaoLiquida.split('.').join('').split(',').join('.'));
                        valorLiquido = parseFloat(antecipacao.vlAntecipacaoLiquida.split('.').join('').split(',').join('.'));
                    }catch(ex){
                        $scope.showModalAlerta('Valor líquido informado é inválido! (registro ' + (k + 1) + ')');
                        return false;
                    }
                }
                else valorLiquido = antecipacao.vlAntecipacaoLiquida;
			}
			//console.log(valorLiquido);
			/*if(valorLiquido === 0.0){
				$scope.showModalAlerta('Informe o valor líquido do registro ' + (k + 1));
				return false;
			}*/
            
            valorB += valorBruto;
            valorL += parseFloat(valorLiquido.toFixed(2));
		}
        
        //console.log(valorOperacao); 
        //console.log(valorB);
        if(Math.abs(valorOperacao - valorB) > 0.001){
            $scope.showModalAlerta('Valor da operação informado é diferente do somatório dos valores de cada lançamento de antecipação');
			return false;
        }
        
        //console.log(valorOperacaoLiquido);
        //console.log(valorL);
        if(Math.abs(valorOperacaoLiquido - valorL) > 0.001){
            $scope.showModalAlerta('Valor líquido informado é diferente do somatório dos valores líquidos de cada lançamento de antecipação');
			return false;
        }
        
		return true;
	}
                                
    $scope.cadastraAntecipacao = function(){
        if(!validaCamposModalAntecipacao())
			return;
        //console.log($scope.modalAntecipacao.antecipacoes);
		// Confirma
		$scope.showModalConfirmacao('Confirmação', 
            "A antecipação será armazenada. Confirma?",
            cadastraAntecipacao, undefined, 'Sim', 'Não'); 
    }   
    
	
	
    var cadastraAntecipacao = function(){
		//if(!validaCamposModalAntecipacao()) return;
		
		$scope.showProgress();
		
        var vlOperacao = typeof $scope.modalAntecipacao.vlOperacao === 'string' ?parseFloat($scope.modalAntecipacao.vlOperacao.split('.').join('').split(',').join('.')) : $scope.modalAntecipacao.vlOperacao;
        var vlLiquido = typeof $scope.modalAntecipacao.vlLiquido === 'string' ? parseFloat($scope.modalAntecipacao.vlLiquido.split('.').join('').split(',').join('.')) : $scope.modalAntecipacao.vlLiquido;
        var txJuros = typeof $scope.modalAntecipacao.txJuros === 'string' ? parseFloat($scope.modalAntecipacao.txJuros.split('.').join('').split(',').join('.')) : $scope.modalAntecipacao.txJuros;
        var txIOF = typeof $scope.modalAntecipacao.txIOF === 'string' ? parseFloat($scope.modalAntecipacao.txIOF.split('.').join('').split(',').join('.')) : $scope.modalAntecipacao.txIOF;
        var txIOFAdicional = typeof $scope.modalAntecipacao.txIOFAdicional === 'string' ? parseFloat($scope.modalAntecipacao.txIOFAdicional.split('.').join('').split(',').join('.')) : $scope.modalAntecipacao.txIOFAdicional;
        
        
        // $scope.validaData($scope.modalAntecipacao.dtAntecipacaoBancaria);
		var json = { idAntecipacaoBancaria : -1,
                     vlOperacao : vlOperacao,
                     txJuros : txJuros,
                     txIOF : txIOF,
                     txIOFAdicional : txIOFAdicional,
                     vlLiquido : vlLiquido,
                     dtAntecipacaoBancaria : $scope.getDataFromString($scope.getDataString($scope.modalAntecipacao.dtAntecipacaoBancaria)),
					 cdAdquirente : $scope.modalAntecipacao.adquirente.cdAdquirente,
					 cdContaCorrente : $scope.modalAntecipacao.conta.cdContaCorrente,
					 antecipacoes : []
				   };
		for(var k = 0; k < $scope.modalAntecipacao.antecipacoes.length; k++){
			var antecipacao = $scope.modalAntecipacao.antecipacoes[k];
			var valorBruto = parseFloat(antecipacao.vlAntecipacao.split('.').join('').split(',').join('.'));
            var vlJuros = typeof antecipacao.vlJuros === 'string' ?parseFloat(antecipacao.vlJuros.split('.').join('').split(',').join('.')) : antecipacao.vlJuros;
            var vlIOF = typeof antecipacao.vlIOF === 'string' ? parseFloat(antecipacao.vlIOF.split('.').join('').split(',').join('.')) : antecipacao.vlIOF;
            var vlIOFAdicional = typeof antecipacao.vlIOFAdicional === 'string' ?parseFloat(antecipacao.vlIOFAdicional.split('.').join('').split(',').join('.'))  : antecipacao.vlIOFAdicional;
			//var valorLiquido = typeof antecipacao.vlAntecipacaoLiquida === 'string' ? parseFloat(antecipacao.vlAntecipacaoLiquida.split('.').join('').split(',').join('.')) : antecipacao.vlAntecipacaoLiquida;
            var dtVencimento = $scope.getDataFromString($scope.getDataString(antecipacao.dtVencimento));
            //console.log(dtVencimento);
			json.antecipacoes.push({ idAntecipacaoBancariaDetalhe : -1,  
                                    vlAntecipacao : valorBruto,
									vlJuros : parseFloat(vlJuros.toFixed(2)),
								    vlIOF : parseFloat(vlIOF.toFixed(2)),
								    vlIOFAdicional : parseFloat(vlIOFAdicional.toFixed(2)),
									dtVencimento : dtVencimento,
									cdBandeira : antecipacao.bandeira && antecipacao.bandeira !== null ? antecipacao.bandeira.cdBandeira : null});
		}
		
		//console.log(json);
		
		$webapi.post($apis.getUrl($apis.card.tbantecipacaobancaria, undefined,
                       {id: 'token', valor: $scope.token}), json)
            .then(function(dados){
                    $scope.showAlert('Antecipação bancária cadastrada com sucesso!', true, 'success', true);
                    // Fecha o modal
                    fechaModalAntecipacao();
					// Tira progress
					$scope.hideProgress();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao cadastrar antecipação bancária (' + failData.status + ')', true, 'danger', true); 
                     $scope.hideProgress();
                  });  
    }
    
    
    
    
    // EXCLUSÃO
    
    $scope.excluiAntecipacao = function(antecipacao){
        if(!antecipacao || antecipacao === null) return;
        $scope.showModalConfirmacao('Confirmação', 
            'Tem certeza que deseja remover a antecipação bancária?',
            excluiAntecipacao, antecipacao.idAntecipacaoBancaria, 'Sim', 'Não'); 
    }
    
    var excluiAntecipacao = function(idAntecipacaoBancaria){
        $scope.showProgress(divPortletBodyFiltrosPos, 10000);  
        $scope.showProgress(divPortletBodyAntecipacoesPos);
        
        $webapi.delete($apis.getUrl($apis.getUrl($apis.card.tbantecipacaobancaria, undefined,
                                     [{id: 'token', valor: $scope.token},
                                      {id: 'idAntecipacaoBancaria', valor: idAntecipacaoBancaria}])))
            .then(function(dados){
                    $scope.showAlert('Antecipação bancária excluída com sucesso!', true, 'success', true);
                    // Atualiza...
                    buscaAntecipacoes(true);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao excluir a antecipação bancária (' + failData.status + ')', true, 'danger', true); 
                     $scope.hideProgress(divPortletBodyFiltrosPos);
                     $scope.hideProgress(divPortletBodyAntecipacoesPos);
                  }); 
    }  
    
    
    
                       
    // EDIÇÃO
    
    var refreshBandeirasModalAntecipacao = function(){
        //console.log("refresh bandeiras");
        if(!$scope.modalAntecipacao.antecipacoes || $scope.modalAntecipacao.antecipacoes === null || $scope.modalAntecipacao.antecipacoes.length === 0 || !$scope.modalAntecipacao.bandeiras || $scope.modalAntecipacao.bandeiras === null || $scope.modalAntecipacao.bandeiras.length === 0){
            //console.log($scope.modalAntecipacao.bandeiras);
            //console.log($scope.modalAntecipacao.antecipacoes);
            return;
        }
        
        //console.log($scope.modalAntecipacao.bandeiras);
        //console.log($scope.modalAntecipacao.antecipacoes);
        for(var k = 0; k < $scope.modalAntecipacao.antecipacoes.length; k++){
            var antecipacao = $scope.modalAntecipacao.antecipacoes[k];
            //console.log(antecipacao);
            if(antecipacao.bandeira && antecipacao.bandeira !== null){
                var cdBandeira = antecipacao.bandeira.cdBandeira;
                antecipacao.bandeira = $filter('filter')($scope.modalAntecipacao.bandeiras, function(b){return b.cdBandeira === cdBandeira})[0];
            }
        }
    }
    
    $scope.editaAntecipacao = function(antecipacao){
        //console.log(antecipacao);
        $scope.modalAntecipacao.exibeDataAntecipacao = false;
        // Conta
        $scope.modalAntecipacao.conta = $filter('filter')($scope.contas, function(c){return c.cdContaCorrente === antecipacao.cdContaCorrente})[0];
        // Adquirente
        $scope.modalAntecipacao.adquirente = $filter('filter')($scope.adquirentes, function(a){return a.cdAdquirente === antecipacao.tbAdquirente.cdAdquirente})[0];
        // Data de Antecipação
        $scope.modalAntecipacao.dtAntecipacaoBancaria = $scope.getDataFromDate(antecipacao.dtAntecipacaoBancaria);
        // Valores
        $scope.modalAntecipacao.valorBrutoTotal = antecipacao.vlOperacao;
        $scope.modalAntecipacao.valorLiquidoTotal = antecipacao.vlLiquido;
        $scope.modalAntecipacao.vlOperacao = antecipacao.vlOperacao;
        $scope.modalAntecipacao.vlLiquido = antecipacao.vlLiquido;
        $scope.modalAntecipacao.txIOF = antecipacao.txIOF;
        $scope.modalAntecipacao.txJuros = antecipacao.txJuros;
        $scope.modalAntecipacao.txIOFAdicional = antecipacao.txIOFAdicional;
        // Old Info
        $scope.modalAntecipacao.old = antecipacao;
        // Bandeira
        $scope.modalAntecipacao.antecipacoes = [];
        for(var k = 0; k < antecipacao.antecipacoes.length; k++){
            var a = antecipacao.antecipacoes[k]; // 
            $scope.modalAntecipacao.antecipacoes.push({ idAntecipacaoBancariaDetalhe : a.idAntecipacaoBancariaDetalhe,
                                                        dtVencimento : $scope.getDataFromDate(a.dtVencimento),
                                                        bandeira : a.tbBandeira,
                                                        vlAntecipacao : a.vlAntecipacao,
                                                        vlIOF : a.vlIOF,
                                                        vlIOFAdicional : a.vlIOFAdicional,
                                                        vlJuros : a.vlJuros,
                                                        vlAntecipacaoLiquida : a.vlAntecipacaoLiquida,
                                                        exibeDataVencimento : false,
                                                       });
        }
        //console.log($scope.modalAntecipacao.antecipacoes);
        if(!$scope.filtro.adquirente || $scope.filtro.adquirente === null || $scope.modalAntecipacao.adquirente.cdAdquirente !== $scope.filtro.adquirente.cdAdquirente)
			$scope.alterouAdquirenteModalAntecipacao(true); // busca bandeiras
        else{
			angular.copy($scope.bandeiras, $scope.modalAntecipacao.bandeiras);
            refreshBandeirasModalAntecipacao();
        }
	

        // Calcula demais valores
        $scope.calculaValorTotal();
        
                
        exibeModalAntecipacao();
    }
    
    
    $scope.alteraAntecipacao = function(){
        if(!validaCamposModalAntecipacao())
			return;
        
        var vlOperacao = typeof $scope.modalAntecipacao.vlOperacao === 'string' ?parseFloat($scope.modalAntecipacao.vlOperacao.split('.').join('').split(',').join('.')) : $scope.modalAntecipacao.vlOperacao;
        var vlLiquido = typeof $scope.modalAntecipacao.vlLiquido === 'string' ? parseFloat($scope.modalAntecipacao.vlLiquido.split('.').join('').split(',').join('.')) : $scope.modalAntecipacao.vlLiquido;
        var txJuros = typeof $scope.modalAntecipacao.txJuros === 'string' ? parseFloat($scope.modalAntecipacao.txJuros.split('.').join('').split(',').join('.')) : $scope.modalAntecipacao.txJuros;
        var txIOF = typeof $scope.modalAntecipacao.txIOF === 'string' ? parseFloat($scope.modalAntecipacao.txIOF.split('.').join('').split(',').join('.')) : $scope.modalAntecipacao.txIOF;
        var txIOFAdicional = typeof $scope.modalAntecipacao.txIOFAdicional === 'string' ? parseFloat($scope.modalAntecipacao.txIOFAdicional.split('.').join('').split(',').join('.')) : $scope.modalAntecipacao.txIOFAdicional;
        
        // Avalia mudanças e controi o JSON
        // $scope.validaData($scope.modalAntecipacao.dtAntecipacaoBancaria);
		var json = { idAntecipacaoBancaria : $scope.modalAntecipacao.old.idAntecipacaoBancaria,
                     vlOperacao : vlOperacao,
                     txJuros : txJuros,
                     txIOF : txIOF,
                     txIOFAdicional : txIOFAdicional,
                     vlLiquido : vlLiquido,
                     dtAntecipacaoBancaria : $scope.getDataFromString($scope.getDataString($scope.modalAntecipacao.dtAntecipacaoBancaria)),
					 cdAdquirente : $scope.modalAntecipacao.adquirente.cdAdquirente,
					 cdContaCorrente : $scope.modalAntecipacao.conta.cdContaCorrente,
					 antecipacoes : [],
                     deletar : []
				   };
		for(var k = 0; k < $scope.modalAntecipacao.antecipacoes.length; k++){
			var antecipacao = $scope.modalAntecipacao.antecipacoes[k];
            var idAntecipacaoBancariaDetalhe = antecipacao.idAntecipacaoBancariaDetalhe;
            var valorBruto = typeof antecipacao.vlAntecipacao === 'string' ? parseFloat(antecipacao.vlAntecipacao.split('.').join('').split(',').join('.')) : antecipacao.vlAntecipacao;
            var vlJuros = typeof antecipacao.vlJuros === 'string' ? parseFloat(antecipacao.vlJuros.split('.').join('').split(',').join('.')) : antecipacao.vlJuros;
            var vlIOF = typeof antecipacao.vlIOF === 'string' ? parseFloat(antecipacao.vlIOF.split('.').join('').split(',').join('.')) : antecipacao.vlIOF;
            var vlIOFAdicional = typeof antecipacao.vlIOFAdicional === 'string' ? parseFloat(antecipacao.vlIOFAdicional.split('.').join('').split(',').join('.')) : antecipacao.vlIOFAdicional;
			//var valorLiquido = typeof antecipacao.vlAntecipacaoLiquida === 'string' ? parseFloat(antecipacao.vlAntecipacaoLiquida.split('.').join('').split(',').join('.')) : antecipacao.vlAntecipacaoLiquida;
            var dtVencimento = antecipacao.dtVencimento;
            
            //console.log("Detalhe: " + idAntecipacaoBancariaDetalhe);
            /*if(idAntecipacaoBancariaDetalhe > 0){
                
                // Obtém o antigo
                var oldAntecipacao = $filter('filter')($scope.modalAntecipacao.old.antecipacoes, function(a){return a.idAntecipacaoBancariaDetalhe === idAntecipacaoBancariaDetalhe})[0];
                //console.log(oldAntecipacao);
                if(oldAntecipacao.vlAntecipacao === valorBruto &&
                   //oldAntecipacao.vlAntecipacaoLiquida === valorLiquido &&
                   //$scope.getDataString(oldAntecipacao.dtVencimento) === dtVencimento &&
                   ((oldAntecipacao.tbBandeira === null && (!antecipacao.bandeira || antecipacao.bandeira === null)) ||
                    (oldAntecipacao.tbBandeira !== null && antecipacao.bandeira && antecipacao.bandeira !== null && oldAntecipacao.tbBandeira.cdBandeira === antecipacao.bandeira.cdBandeira))){
                    // Não houve mudanças!
                    //console.log("Não houve mudanças")
                    continue;
                }
                
                //console.log(oldAntecipacao.vlAntecipacao + " = " + valorBruto + " ? " + (oldAntecipacao.valorBruto === valorBruto));
                //console.log(oldAntecipacao.vlAntecipacaoLiquida + " = " + valorLiquido + " ? " + (oldAntecipacao.vlAntecipacaoLiquida === valorLiquido));
                //console.log($scope.getDataString(oldAntecipacao.dtVencimento) + " = " + dtVencimento + " ? " + ($scope.getDataString(oldAntecipacao.dtVencimento) === dtVencimento));
                //console.log((oldAntecipacao.tbBandeira && oldAntecipacao.tbBandeira !== null ? oldAntecipacao.tbBandeira.cdBandeira : 'NULL') + " = " + (antecipacao.bandeira && antecipacao.bandeira !== null ? antecipacao.bandeira.cdBandeira : 'NULL') + " ? " + ((oldAntecipacao.tbBandeira === null && (!antecipacao.bandeira || antecipacao.bandeira === null)) || (oldAntecipacao.tbBandeira !== null && antecipacao.bandeira && antecipacao.bandeira !== null && oldAntecipacao.tbBandeira.cdBandeira === antecipacao.bandeira.cdBandeira)));
                
            }*/
			
			json.antecipacoes.push({ idAntecipacaoBancariaDetalhe : idAntecipacaoBancariaDetalhe,  
                                    vlAntecipacao : valorBruto,
                                    vlIOFAdicional : parseFloat(vlIOFAdicional.toFixed(2)),
                                    vlIOF : parseFloat(vlIOF.toFixed(2)),
                                    vlJuros : parseFloat(vlJuros.toFixed(2)),
									//vlAntecipacaoLiquida: valorLiquido,
									dtVencimento : $scope.getDataFromString($scope.getDataString(dtVencimento)),
									cdBandeira : antecipacao.bandeira && antecipacao.bandeira !== null ? antecipacao.bandeira.cdBandeira : null});
		}
        
        // Deletou algum?
        for(var k = 0; k < $scope.modalAntecipacao.old.antecipacoes.length; k++){
            var oldAntecipacao = $scope.modalAntecipacao.old.antecipacoes[k];
            if($filter('filter')($scope.modalAntecipacao.antecipacoes, function(a){return a.idAntecipacaoBancariaDetalhe === oldAntecipacao.idAntecipacaoBancariaDetalhe}).length === 0){
                json.deletar.push(oldAntecipacao.idAntecipacaoBancariaDetalhe);
            }
        }
		
		//console.log(json);
        
        /*if(json.deletar.length === 0 && json.antecipacoes.length === 0 &&
           $scope.getDataString($scope.modalAntecipacao.old.dtAntecipacaoBancaria) === $scope.modalAntecipacao.dtAntecipacaoBancaria && $scope.modalAntecipacao.old.tbAdquirente.cdAdquirente === $scope.modalAntecipacao.adquirente.cdAdquirente){
            fechaModalAntecipacao();
            return;
        }*/
        
		// Confirma
		$scope.showModalConfirmacao('Confirmação', 
            "A antecipação será alterada. Confirma alterações?",
            alteraAntecipacao, json, 'Sim', 'Não');
    }
                                
    var alteraAntecipacao = function(json){
        $scope.showProgress();
		

		$webapi.update($apis.getUrl($apis.card.tbantecipacaobancaria, undefined,
                       {id: 'token', valor: $scope.token}), json)
            .then(function(dados){
                    $scope.showAlert('Antecipação bancária alterada com sucesso!', true, 'success', true);
                    // Fecha o modal
                    fechaModalAntecipacao();
                    // Fecha progress
                    $scope.hideProgress();
					// Atualiza...
                    buscaAntecipacoes();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao alterar a antecipação bancária (' + failData.status + ')', true, 'danger', true); 
                     $scope.hideProgress();
                  });
    }
    
    
    
    
    
    // ANTECIPAÇÃO QUE AJUSTA PARCELAS DO CARD SERVICES
    /*$scope.informaValoresCS = function(antecipacao){
        //console.log(antecipacao && antecipacao !== null && antecipacao.cdBanco === '047');
        return //$scope.PERMISSAO_ADMINISTRATIVO && // somente quem tem permissão administrativa!
               antecipacao && antecipacao !== null && antecipacao.cdBanco === '047'; // BANESE
    }*/
    
    $scope.anteciparParcelas = function(antecipacao, vencimento, desfazerAntecipacao){
        
        /*if(!$scope.PERMISSAO_ADMINISTRATIVO){
            $scope.showAlert('Você não possui permissão para realizar essa operação!'); 
            return;
        }*/
        if(!$scope.informaValoresCS){
            $scope.showAlert('Essa operação não permitida para a conta selecionada!'); 
            return;
        }
        
        var ids = [];
        if(vencimento && vencimento !== null){
            // Somente o vencimento
            ids.push(vencimento.idAntecipacaoBancariaDetalhe);
        }else{
            for(var k = 0; k < antecipacao.antecipacoes.length; k++)
                ids.push(antecipacao.antecipacoes[k].idAntecipacaoBancariaDetalhe);
        }
        
        var json = { desfazerAntecipacoes : desfazerAntecipacao ? true : false,
                     idsAntecipacaoBancariaDetalhe : ids
                   };
        
        var text = desfazerAntecipacao ? "Confirma desfazer as antecipações das parcelas?" :
                                         "Para que o processo seja efetivo, é necessário que todas as cargas de 'VENDAS' (de competência inferior a " + $scope.getDataString(antecipacao.dtAntecipacaoBancaria) + ") tenham sido carregadas corretamente, as cargas de 'AJUSTES E TARIFAS' para os vencimentos inferiores a data corrente, assim como 'LANÇAMENTOS FUTUROS' para os vencimentos superior ou igual a data corrente. Confirma a antecipação das parcelas?";
        
        // Confirma
		$scope.showModalConfirmacao('Confirmação', text, anteciparParcelas, json, 'Sim', 'Não');
    }
    
    var anteciparParcelas = function(json){
        $scope.showProgress(divPortletBodyAntecipacoesPos);
        $scope.showProgress(divPortletBodyFiltrosPos);
        
        $webapi.update($apis.getUrl($apis.card.tbantecipacaobancariadetalhe, undefined,
                       {id: 'token', valor: $scope.token}), json)
            .then(function(dados){
                    $scope.showAlert('Operação realizada com sucesso!', true, 'success', true);
					// Atualiza...
                    buscaAntecipacoes(true);
                    //$scope.hideProgress(divPortletBodyAntecipacoesPos);
                    //$scope.hideProgress(divPortletBodyFiltrosPos);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login 
                     else $scope.showModalAlerta('Houve uma falha ao realizar a operação. (' + (failData.dados && failData.dados !== null ? failData.dados : failData.status) + ')', 'Erro');
                     $scope.hideProgress(divPortletBodyAntecipacoesPos);
                     $scope.hideProgress(divPortletBodyFiltrosPos);
                  });
    }
    
}]);
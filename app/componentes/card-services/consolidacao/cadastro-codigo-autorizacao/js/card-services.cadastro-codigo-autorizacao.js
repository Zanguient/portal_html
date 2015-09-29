/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 11/09/2015
 *
 */

// App
angular.module("card-services-cadastro-codigo-autorizacao", []) 

.controller("card-services-cadastro-codigo-autorizacaoCtrl", ['$scope',   
                                            '$state',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            '$timeout',
                                            '$filter',
                                            function($scope,$state,/*$campos,*/
                                                     $webapi,$apis,$timeout,$filter){  
    
    $scope.lojas = [];
    $scope.sacados = [];
    $scope.pdvs = [];
    $scope.autorizacoes = [];
    // Filtro
    $scope.paginaInformada = 1;
    $scope.itens_pagina = [50, 100, 150, 200];
    $scope.filtro = { data : new Date(), loja : null, sacado : null, pdv : null,
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0 };
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyAutorizacaoPos = 1; // posição da div que vai receber o loading progress 
    // flags
    $scope.abrirCalendarioData = false;
    $scope.exibeTela = false;
    
    
    // Inicialização do controller
    $scope.cardServices_cadastroCodigoAutorizacaoInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Cadastro de Código de Autorização';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    $scope.filtro.loja = null;
                    $scope.filtro.sacado = null;
                    $scope.filtro.pdv = null;
                    buscaLojas(true, true);
                }else{ // reseta tudo e não faz buscas 
                    $scope.lojas = []; 
                    $scope.sacados = [];
                    $scope.pdvs = [];
                }
            }
        });
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega dados
            buscaLojas(true, true);
        });
        // Acessou a tela
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
        buscaLojas(true, true);
    };
    
    
    
    
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaAutorizacoes(); 
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
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        if($scope.autorizacoes.length > 0) buscaAutorizacoes();    
    };
    
    
    // FILTRO

    /**
      * Obtém os filtros de busca
      */
    var obtemFiltrosBusca = function(){
       var filtros = [];
        
       // Data
       filtros.push({id: /*$campos.rezende.pgsql.pdvs.data*/ 102,
                    valor: $scope.getFiltroData($scope.filtro.data)});
        
       // Loja
       if($scope.filtro.loja && $scope.filtro.loja !== null){
           filtros.push({id: /*$campos.rezende.pgsql.pdvs.cod_empresa*/ 108, 
                         valor: $scope.filtro.loja.cod_empresa});  
       }
        
        // Loja
       if($scope.filtro.sacado && $scope.filtro.sacado !== null){
           filtros.push({id: /*$campos.rezende.pgsql.pdvs.cod_pessoa*/ 107, 
                         valor: $scope.filtro.sacado.cod_pessoa});  
       }
        
        // Pdv
        if($scope.filtro.pdv && $scope.filtro.pdv !== null){
            filtros.push({id: /*$campos.tax.tbmanifesto.cod_pdv */ 106,
                          valor: $scope.filtro.pdv.cod_pdv}); 
        }
    
        return filtros.length > 0 ? filtros : undefined;
    }       
    
                                                              
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        $scope.filtro.data = new Date();
        $scope.filtro.loja = $scope.filtro.sacado = $scope.filtro.pdv = null; 
    }   
    
                                                              
    // DATA
    $scope.exibeCalendarioData = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.abrirCalendarioData = !$scope.abrirCalendarioData;
      };
    $scope.alterouData = function(){
      /*ajustaIntervaloDeData();*/
    };
    
    
    
    
    // LOJA
    var buscaLojas = function(buscarSacados, buscarPdvs){
        
        if(!$scope.usuariologado.grupoempresa || $scope.usuariologado.grupoempresa === null){ 
           if(buscarSacados) buscaSacados(false, buscarPdvs);
           return;
       }
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       $webapi.get($apis.getUrl($apis.rezende.pgsql.tabempresa, 
                                [$scope.token, 0, /*$campos.rezende.pgsql.tabempresa.nom_fantasia*/ 104])) 
            .then(function(dados){
                $scope.lojas = dados.Registros;
                $scope.filtro.loja = null;
                if(buscarSacados) buscaSacados(true, buscarPdvs);
                else if(buscarPdvs) buscaPdvs(true);
                else $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter lojas (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });         
    }
    /**
      * Selecionou uma loja => BUSCA PDVs
      */
    $scope.alterouLoja = function(){
        //console.log($scope.filtro.loja); 
        $scope.filtro.pdv = null;
        buscaPdvs();
    }; 
    
    
    // BANDEIRA/SACADO
    var buscaSacados = function(progressoemexecucao, buscarPdvs){
        
       if(!progressoemexecucao) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       $webapi.get($apis.getUrl($apis.rezende.pgsql.tabpessoa, 
                                [$scope.token, 0, /*$campos.rezende.pgsql.tabpessoa.nom_pessoa*/ 101])) 
            .then(function(dados){
                $scope.sacados = dados.Registros;
                $scope.filtro.sacado = null;
                if(buscarPdvs) buscaPdvs(true);
                else $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter bandeiras/sacados (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });         
    }
    /**
      * Selecionou uma bandeira/sacado
      */
    $scope.alterouSacado = function(){
        //console.log($scope.filtro.sacado); 
    }; 
    /**
      * Obtém o objeto sacado a partir de sacados
      */
    $scope.getAutorizacaoSacadoInSacados = function(sacado){
        if(!sacado || sacado === null || sacado.cod_pessoa === 0 || $scope.sacados.length === 0) 
            return null;    
        return $filter('filter')($scope.sacados, function(s){return s.cod_pessoa === sacado.cod_pessoa})[0];
    }
    
    
    
    // PDVS
    var buscaPdvs = function(progressoemexecucao){
        
       if(!progressoemexecucao) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
       
       var filtro = undefined;
       
       if($scope.filtro.loja && $scope.filtro.loja !== null){
            filtro = {id: /*$campos.rezende.pgsql.tabpdv.cod_empresa*/ 101,
                      valor: $scope.filtro.loja.cod_empresa};       
       }
        
       $webapi.get($apis.getUrl($apis.rezende.pgsql.tabpdv, 
                                [$scope.token, 2, /*$campos.rezende.pgsql.tabpdv.des_pdv*/ 102], filtro)) 
            .then(function(dados){
                $scope.pdvs = dados.Registros;
                $scope.filtro.pdv = null;
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter pdvs (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });       
    }
    /**
      * Selecionou um pdv
      */
    $scope.alterouPdv = function(){
        //console.log($scope.filtro.pdv); 
    }; 
    
    
    
    
    
    
    
    // CÓDIGO AUTORIZAÇÃO
    
    $scope.buscaAutorizacoes = function(){
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){ $scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        buscaAutorizacoes();
    }
    
    var buscaAutorizacoes = function(progressoemexecucao){
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyAutorizacaoPos);
        
       // Filtros    
       var filtros = obtemFiltrosBusca();
           
       //console.log(filtros);
       
       $webapi.get($apis.getUrl($apis.rezende.pgsql.pdvs, 
                                [$scope.token, 0, /* $campos.rezende.pgsql.pdvs.data */102, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){

                // Obtém os dados
                $scope.autorizacoes = dados.Registros;
           
                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.autorizacoes.length === 0) $scope.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }
                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyAutorizacaoPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter dados de código de autorização (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyAutorizacaoPos);
              });               
    }
    
    
    
    
    
    // AÇÕES
    /**
      * Salva as autorizacoes preenchidas
      */
    $scope.salvarAutorizacoes = function(){
        
    }
    
    /**
      * Salva a autorização
      */
    $scope.salvaAutorizacao = function(autorizacao){
        console.log(autorizacao);
    }
    
}]);
